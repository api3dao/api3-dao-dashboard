/**
 * When a proposal is passed, it can be used to execute the EVM script that was specified when the proposal was created.
 * The script can be a function call or multiple function calls. Proposals need to be executed by separate transaction
 * and the executor will pay the gas cost for the EVM script that is run.
 *
 * For now, we only support a single function call in the EVM script. The reasons are that it's enough for the most
 * cases, it's easier to encode it and we can create a simpler UI for end users.
 *
 * The EVM script is basically encoded "bytes" which contain the function(s) to be called and their parameters. We also
 * support ENS names when specifying them as function parameters. The conversion needs to take place before the script
 * is encoded. The encoding uses a predefined format (see the links below) and you can use "defaultAbiCoder" for
 * encoding the bytes value.
 *
 * @see execute function implementation:
 *      https://github.com/aragon/aragon-apps/blob/631048d54b9cc71058abb8bd7c17f6738755d950/apps/agent/contracts/Agent.sol#L70
 * @see EVM script layout:
 *      https://github.com/aragon/aragonOS/blob/f3ae59b00f73984e562df00129c925339cd069ff/contracts/evmscript/executors/CallsScript.sol#L26
 */
import { go, GoResult, goSync, fail, success } from '@api3/commons';
import { BigNumber, providers, utils } from 'ethers';
import range from 'lodash/range';
import { DecodedEvmScript, EvmScriptCall, Proposal, ProposalMetadata } from '../../../chain-data';
import { Api3Agent } from '../../../contracts';
import { convertToAddressOrThrow } from './ens-name';
import { isKnownMultiCallScript } from './known-scripts';
import { MULTI_CALL_METADATA_SCHEME_VERSION } from './metadata';
import { NewProposalFormData } from './types';

// The spec ID of Aragon's CallsScript executor, the first 4 bytes of every EVM script the voting app accepts
const CALLS_SCRIPT_SPEC_ID = '0x00000001';

// Similar to https://web3js.readthedocs.io/en/v1.2.0/web3-eth-abi.html#encodefunctionsignature
export const encodeFunctionSignature = (functionFragment: string) => {
  return utils.hexDataSlice(utils.keccak256(utils.toUtf8Bytes(functionFragment)), 0, 4);
};

/**
 * Converts BigNumber(s) decoded by ethers to strings for presentational purposes.
 *
 * @param value decoded by ethers (array or single value)
 */
export const stringifyBigNumbersRecursively = (value: unknown): any => {
  if (BigNumber.isBigNumber(value)) return value.toString();
  else if (Array.isArray(value)) return value.map(stringifyBigNumbersRecursively);
  else return value;
};

// https://github.com/aragon/aragon-apps/blob/631048d54b9cc71058abb8bd7c17f6738755d950/apps/agent/contracts/Agent.sol#L70
const encodedExecuteSignature = encodeFunctionSignature('execute(address,uint256,bytes)');

export class EncodedEvmScriptError extends Error {
  constructor(
    public field:
      | keyof Pick<NewProposalFormData, 'parameters' | 'targetSignature' | 'targetValue' | 'targetAddress'>
      | 'generic',
    public value: string
  ) {
    super(`Invalid field value. Details: field=${field}, value=${value}`);
  }
}

/**
 * Validates the form data and encodes the EVM script.
 *
 * @see decodeEvmScript for details how the script is decoded
 *
 * @param provider a provider which is able to resolve ENS names
 * @param formData the proposal data to be encoded
 * @param api3Agent the addresses of the voting app agents
 */
export const goEncodeEvmScript = async (
  provider: providers.Provider,
  { version, ...formData }: NewProposalFormData & { version: string },
  api3Agent: Api3Agent
): Promise<GoResult<string>> => {
  // Ensure target address is a valid address or valid ENS name
  const goTargetAddress = await go(() => convertToAddressOrThrow(provider, formData.targetAddress));
  if (!goTargetAddress.success) {
    return fail(new EncodedEvmScriptError('targetAddress', 'Please specify a valid account address'));
  }
  const targetAddress = goTargetAddress.data;

  // Target contract signature must be a valid solidity function signature or be empty (in case of a simple ETH transfer)
  const { targetSignature } = formData;
  if (targetSignature.includes(' ')) {
    return fail(
      new EncodedEvmScriptError('targetSignature', 'Make sure the contract signature contains no whitespace')
    );
  }
  const goValidateTargetSignature = goSync(() => {
    if (!targetSignature) return;
    // We only care whether the following throws or not
    utils.FunctionFragment.from(targetSignature);
  });
  if (!goValidateTargetSignature.success) {
    return fail(new EncodedEvmScriptError('targetSignature', 'Please specify a valid contract signature'));
  }

  // Ensure that the form parameters form a valid JSON array
  const goJsonParams = goSync(() => {
    const json = JSON.parse(formData.parameters);
    if (!Array.isArray(json)) throw new Error('Parameters must be an array');
    return json as unknown[];
  });
  if (!goJsonParams.success) {
    return fail(new EncodedEvmScriptError('parameters', 'Make sure parameters is a valid JSON array'));
  }
  const targetParameters = goJsonParams.data;

  // Extract the parameters that were passed and check if the number of arguments is same as in the function signature
  const goExtractParameters = goSync(() => {
    // Extract the parameter types from the target function signature
    const parameterTypes = targetSignature
      .substring(targetSignature.indexOf('(') + 1, targetSignature.indexOf(')'))
      .split(',')
      // Function can have zero arguments, in that case we want the array to be empty
      .filter((s) => s.length > 0);

    if (parameterTypes.length !== targetParameters.length) {
      throw new Error();
    }

    return parameterTypes;
  });
  if (!goExtractParameters.success) {
    return fail(new EncodedEvmScriptError('parameters', 'Please specify the correct number of function arguments'));
  }
  const parameterTypes = goExtractParameters.data;

  // Resolve ENS names for parameter addresses and encode target parameters using defaultAbiCoder
  const goEncodeParameters = await go(async () => {
    const parameters = await Promise.all(
      range(parameterTypes.length).map(async (i) => {
        const param = targetParameters[i]!;
        if (parameterTypes[i] !== 'address') return param;
        if (typeof param !== 'string') throw new Error('Parameter must be an ENS string');

        return convertToAddressOrThrow(provider, param);
      })
    );
    // Encode the parameters using the parameter types
    return utils.defaultAbiCoder.encode(parameterTypes, parameters);
  });
  if (!goEncodeParameters.success) {
    return fail(
      new EncodedEvmScriptError(
        'parameters',
        // NOTE: Unfortunately, when checking for valid contract signature ethers will check only the formatting issues
        // and will not catch for example a typo "unit256" instead of "uint256". We will catch this here when we try to
        // encode the parameter types and values.
        'Ensure parameters match target contract signature'
      )
    );
  }
  const encodedTargetParameters = goEncodeParameters.data;

  // Ensure value is a non-negative amount (in Wei)
  const goValue = goSync(() => {
    const goParsed = goSync(() => BigNumber.from(formData.targetValue));
    if (!goParsed.success || goParsed.data.lt(0)) throw new Error('Please enter a valid amount in Wei');
    if (!targetSignature && goParsed.data.eq(0)) throw new Error('Value must be greater than 0 for ETH transfers');
    return goParsed.data;
  });
  if (!goValue.success) {
    return fail(new EncodedEvmScriptError('targetValue', goValue.error.message));
  }
  const targetValue = goValue.data;

  // Build the EVM script according to the scheme
  const goBuildEvmScript = goSync(() => {
    // Build the call data that the EVMScript will use (and remove 0x prefix)
    const targetCallData = utils.defaultAbiCoder.encode(
      ['address', 'uint256', 'bytes'],
      [
        targetAddress,
        targetValue,
        // If this is a version 1 proposal, then we need to keep encoding the target signature regardless if it's blank
        // or not, otherwise we could get a script mismatch and a false-positive for the malicious proposal check
        version === '1' || targetSignature
          ? encodeFunctionSignature(targetSignature) + encodedTargetParameters.substring(2)
          : '0x',
      ]
    );

    const callData = encodedExecuteSignature + targetCallData.substring(2);

    // Calculate the length of the call data in bytes
    const callDataLengthInBytes = utils.hexZeroPad(BigNumber.from(callData.substring(2).length / 2).toHexString(), 4);

    // See the EVMScript layout in:
    // https://github.com/aragon/aragonOS/blob/f3ae59b00f73984e562df00129c925339cd069ff/contracts/evmscript/executors/CallsScript.sol#L26
    //
    // Also, remove the 0x prefix in bytes
    const evmScript = [
      CALLS_SCRIPT_SPEC_ID,
      api3Agent[formData.type].substring(2),
      callDataLengthInBytes.substring(2),
      callData.substring(2),
    ].join('');

    return evmScript;
  });
  if (!goBuildEvmScript.success) {
    return fail(
      new EncodedEvmScriptError(
        'generic',
        'Unable to encode the EVM script. Please check that all form fields are correct'
      )
    );
  }

  return success(goBuildEvmScript.data);
};

/**
 * Decodes the EVM script and returns the decoded fields. The decoding is basically formed by doing the inverse
 * operations performed in when encoding the proposal.
 *
 * @see goEncodeEvmScript for details on how the script is encoded
 *
 * @param provider a provider which is able to lookup ENS addresses
 * @param script the EVM script to be decoded
 * @param metadata proposal metadata to help decode the EVM script
 */
export const decodeEvmScript = async (
  provider: providers.Provider,
  script: string,
  metadata: ProposalMetadata
): Promise<DecodedEvmScript | null> => {
  const goResponse = await go(async () => {
    // See the EVMScript layout in:
    // https://github.com/aragon/aragonOS/blob/f3ae59b00f73984e562df00129c925339cd069ff/contracts/evmscript/executors/CallsScript.sol#L26
    const evmScriptPayload = utils.hexDataSlice(script, 4);
    const callData = utils.hexDataSlice(evmScriptPayload, 24);

    // Decode the parameters of the "execute" function:
    // https://github.com/aragon/aragon-apps/blob/631048d54b9cc71058abb8bd7c17f6738755d950/apps/agent/contracts/Agent.sol#L70
    const executionParameters = utils.defaultAbiCoder.decode(
      ['address', 'uint256', 'bytes'],
      utils.hexDataSlice(callData, 4)
    );

    const targetContractAddress = executionParameters[0];
    const value = executionParameters[1];

    // If there is no target signature the transaction is a simple ETH transfer
    if (!metadata.targetSignature) {
      return {
        targetAddress: targetContractAddress,
        value,
        parameters: [],
      };
    }

    // Decode the calldata of the last target function (last argument of the "execute" function) which are the decoded
    // EVM script parameters.
    const targetCallData = executionParameters[2];
    const parameterTypes = metadata.targetSignature
      .substring(metadata.targetSignature.indexOf('(') + 1, metadata.targetSignature.indexOf(')'))
      .split(',');
    const decodedParameters = utils.defaultAbiCoder.decode(parameterTypes, utils.hexDataSlice(targetCallData, 4));

    return {
      targetAddress: targetContractAddress,
      value,
      parameters: stringifyBigNumbersRecursively(decodedParameters),
    };
  });

  if (goResponse.success) return goResponse.data;
  else return null;
};

/**
 * Splits an EVM script into its calls without knowing the ABIs of the targets, which is how proposals created outside
 * of the DAO dashboard (metadata version 3) are decoded. The script has to follow the CallsScript layout, a sequence of
 * (target address, calldata length, calldata) entries. A call that an agent forwards through its "execute" function
 * is unwrapped so that the target, value and calldata are the ones of the inner call, through as many agents as it
 * passes (the primary agent can forward a call to the secondary agent, which forwards it to the target).
 *
 * Returns null when the script does not follow the layout or an "execute" call cannot be decoded.
 *
 * @see EVM script layout:
 *      https://github.com/aragon/aragonOS/blob/f3ae59b00f73984e562df00129c925339cd069ff/contracts/evmscript/executors/CallsScript.sol#L26
 *
 * @param script the EVM script to be decoded
 * @param api3Agent the addresses of the voting app agents, the only contracts whose "execute" calls are unwrapped
 */
export const decodeCallsScript = (script: string, api3Agent: Api3Agent): EvmScriptCall[] | null => {
  const goDecode = goSync(() => {
    if (!utils.isHexString(script) || utils.hexDataSlice(script, 0, 4) !== CALLS_SCRIPT_SPEC_ID) {
      throw new Error('Not a CallsScript');
    }
    const agents = [api3Agent.primary, api3Agent.secondary].map((agent) => agent.toLowerCase());
    const scriptLength = utils.hexDataLength(script);
    const calls: EvmScriptCall[] = [];

    let offset = 4;
    while (offset < scriptLength) {
      // Each entry starts with a 20 byte target address and a 4 byte calldata length
      if (offset + 24 > scriptLength) throw new Error('Truncated call header');
      let targetAddress = utils.getAddress(utils.hexDataSlice(script, offset, offset + 20));
      const dataLength = BigNumber.from(utils.hexDataSlice(script, offset + 20, offset + 24)).toNumber();
      if (offset + 24 + dataLength > scriptLength) throw new Error('Truncated calldata');
      let data = utils.hexDataSlice(script, offset + 24, offset + 24 + dataLength);
      offset += 24 + dataLength;

      // The voting app calls the target directly and sends no ETH
      const viaAgents: string[] = [];
      let value = BigNumber.from(0);
      while (
        agents.includes(targetAddress.toLowerCase()) &&
        utils.hexDataSlice(data, 0, 4) === encodedExecuteSignature
      ) {
        viaAgents.push(targetAddress);
        [targetAddress, value, data] = utils.defaultAbiCoder.decode(
          ['address', 'uint256', 'bytes'],
          utils.hexDataSlice(data, 4)
        );
      }
      calls.push({ targetAddress, viaAgents, value, data });
    }

    return calls;
  });

  return goDecode.success ? goDecode.data : null;
};

/**
 * The inverse of `decodeCallsScript`. Encoding the decoded calls again and comparing the result with the on-chain
 * script is how a version 3 proposal is validated, so a script that only looks like a list of calls (for example with
 * data hidden in the padding of an "execute" call) does not pass.
 */
export const encodeCallsScript = (calls: EvmScriptCall[]) => {
  const entries = calls.map((call) => {
    // Wrap the call into the "execute" calls of its agents, the innermost agent first
    let target = call.targetAddress;
    let value = call.value;
    let data = call.data;
    for (const agent of [...call.viaAgents].reverse()) {
      data =
        encodedExecuteSignature +
        utils.defaultAbiCoder.encode(['address', 'uint256', 'bytes'], [target, value, data]).substring(2);
      target = agent;
      value = BigNumber.from(0);
    }
    const dataLength = utils.hexZeroPad(BigNumber.from(utils.hexDataLength(data)).toHexString(), 4);

    return target.substring(2) + dataLength.substring(2) + data.substring(2);
  });

  return (CALLS_SCRIPT_SPEC_ID + entries.join('')).toLowerCase();
};

export async function isEvmScriptValid(
  provider: providers.Provider,
  api3Agent: Api3Agent,
  proposal: Pick<Proposal, 'type' | 'metadata' | 'decodedEvmScript' | 'script'>
) {
  const { metadata, decodedEvmScript } = proposal;
  if (metadata.version === MULTI_CALL_METADATA_SCHEME_VERSION) {
    if (!isKnownMultiCallScript(proposal.script)) return false;
    const calls = decodeCallsScript(proposal.script, api3Agent);
    return calls !== null && encodeCallsScript(calls) === proposal.script.toLowerCase();
  }
  if (!decodedEvmScript) {
    return false;
  }

  const result = await goEncodeEvmScript(
    provider,
    {
      type: proposal.type,
      targetSignature: metadata.targetSignature ?? '',
      description: metadata.description,
      title: metadata.title,
      parameters: JSON.stringify(decodedEvmScript.parameters),
      targetAddress: decodedEvmScript.targetAddress,
      targetValue: decodedEvmScript.value.toString(),
      version: metadata.version,
    },
    api3Agent
  );

  return result.success && result.data === proposal.script;
}
