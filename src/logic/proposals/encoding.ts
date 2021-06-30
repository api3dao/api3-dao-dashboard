import { BigNumber, utils } from 'ethers';
import { ProposalMetadata, ProposalType } from '../../chain-data';
import { Api3Agent } from '../../contracts';
import { errorFn, GoResult, goSync, GO_RESULT_INDEX, isGoSuccess, successFn } from '../../utils';

/**
 * NOTE: Aragon contracts are flexible but this makes it a bit harder to work with it's contracts. We have created a
 * simple encoding/decoding scheme for the API3 proposals. The implementation of these utilities is inspired by
 * https://github.com/bbenligiray/proposal-test.
 */
export interface NewProposalFormData {
  type: ProposalType;
  title: string;
  description: string;
  targetAddress: string;
  targetSignature: string;
  targetValue: string;
  parameters: string;
}

const METADATA_FORMAT_VERSION = '1';
// https://stackoverflow.com/questions/492090/least-used-delimiter-character-in-normal-text-ascii-128/41555511#41555511
export const METADATA_DELIMETER = String.fromCharCode(31);

export const encodeMetadata = (formData: NewProposalFormData) =>
  [METADATA_FORMAT_VERSION, formData.targetSignature, formData.title, formData.description].join(METADATA_DELIMETER);

export const decodeMetadata = (metadata: string): ProposalMetadata | null => {
  const tokens = metadata.split(METADATA_DELIMETER);
  // NOTE: Our metadata encoding is just a convention and people might create proposals directly via the contract. They
  // shouldn't do it and we will probably just ignore their proposal created this way.
  if (tokens.length !== 4) return null;
  return { version: tokens[0]!, targetSignature: tokens[1]!, title: tokens[2]!, description: tokens[3]! };
};

function encodeFunctionSignature(functionFragment: any) {
  return utils.hexDataSlice(utils.keccak256(utils.toUtf8Bytes(functionFragment)), 0, 4);
}

type EncodedEvmScriptError = {
  field:
    | keyof Pick<NewProposalFormData, 'parameters' | 'targetSignature' | 'targetValue' | 'targetAddress'>
    | 'generic';
  value: string;
};
type EncodedEvmScript = GoResult<string, EncodedEvmScriptError>;

export const encodeEvmScript = (formData: NewProposalFormData, api3Agent: Api3Agent): EncodedEvmScript => {
  const goJsonParams = goSync(() => {
    const json = JSON.parse(formData.parameters);
    if (!Array.isArray(json)) throw new Error('Parameters must be an array');
    return json;
  });
  if (!isGoSuccess(goJsonParams)) {
    return errorFn({ field: 'parameters', value: 'Make sure parameters is a valid JSON array' });
  }
  const targetParameters = goJsonParams[GO_RESULT_INDEX];

  const goTargetSignature = goSync(() => utils.FunctionFragment.from(formData.targetSignature));
  if (!isGoSuccess(goTargetSignature)) {
    return errorFn({ field: 'targetSignature', value: 'Please specify a valid contract signature' });
  }
  const targetSignature = formData.targetSignature;

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
  if (!isGoSuccess(goExtractParameters)) {
    return errorFn({ field: 'parameters', value: 'Please specify the correct number of function arguments' });
  }
  const parameterTypes = goExtractParameters[GO_RESULT_INDEX];

  const goEncodeParameters = goSync(() => {
    // Encode the parameters using the parameter types
    return utils.defaultAbiCoder.encode(parameterTypes, targetParameters);
  });
  if (!isGoSuccess(goEncodeParameters)) {
    return errorFn({
      field: 'parameters',
      // NOTE: Unfortunately, when checking for valid contract signature ethers will check only the formatting issues
      // and will not catch for example a typo "unit256" instead of "uint256". We will catch this here when we try to
      // encode the parameter types and values.
      value: 'Ensure parameters match target contract signature',
    });
  }
  const encodedTargetParameters = goEncodeParameters[GO_RESULT_INDEX];

  const targetAddress = formData.targetAddress;
  if (!utils.isAddress(targetAddress)) {
    return errorFn({ field: 'targetAddress', value: 'Please specify a valid account address' });
  }

  const goValue = goSync(() => {
    const parsed = utils.parseEther(formData.targetValue);
    if (parsed.lt(0)) throw new Error();
    return parsed;
  });
  if (!isGoSuccess(goValue)) {
    return errorFn({ field: 'targetValue', value: 'Please enter valid non-negative ETH amount' });
  }
  const targetValue = goValue[GO_RESULT_INDEX];

  const goBuildEvmScript = goSync(() => {
    const encodedExecuteSignature = encodeFunctionSignature('execute(address,uint256,bytes)');
    // Build the call data that the EVMScript will use
    const callData =
      encodedExecuteSignature +
      utils.defaultAbiCoder
        .encode(
          ['address', 'uint256', 'bytes'],
          [targetAddress, targetValue, encodeFunctionSignature(targetSignature) + encodedTargetParameters.substring(2)]
        )
        .substring(2);
    // Calculate the length of the call data (in bytes) because that also goes in the EVMScript
    const callDataLengthInBytes = utils.hexZeroPad(BigNumber.from(callData.substring(2).length / 2).toHexString(), 4);
    // See the EVMScript layout in
    // https://github.com/aragon/aragonOS/blob/f3ae59b00f73984e562df00129c925339cd069ff/contracts/evmscript/executors/CallsScript.sol#L26
    const evmScript = [
      '0x00000001',
      api3Agent[formData.type].substring(2),
      callDataLengthInBytes.substring(2),
      callData.substring(2),
    ].join('');

    return evmScript;
  });
  if (!isGoSuccess(goBuildEvmScript)) {
    return errorFn({
      field: 'generic',
      value: 'Unable to encode the EVM script. Please check that all form fields are correct',
    });
  }

  return successFn(goBuildEvmScript[GO_RESULT_INDEX]);
};

export interface DecodedEvmScript {
  targetAddress: string;
  parameters: unknown[];
  rawParameters: unknown[];
  value: BigNumber; // amount of ETH that is sent to the contract
}

export const decodeEvmScript = (script: string, metadata: ProposalMetadata): DecodedEvmScript | null => {
  const goResponse = goSync(() => {
    const evmScriptPayload = utils.hexDataSlice(script, 4);
    const callData = utils.hexDataSlice(evmScriptPayload, 24);

    // https://github.com/aragon/aragon-apps/blob/631048d54b9cc71058abb8bd7c17f6738755d950/apps/agent/contracts/Agent.sol#L70
    const executionParameters = utils.defaultAbiCoder.decode(
      ['address', 'uint256', 'bytes'],
      utils.hexDataSlice(callData, 4)
    );
    const targetContractAddress = executionParameters[0];
    const value = executionParameters[1];

    // Decode the calldata
    const targetCallData = executionParameters[2];
    const parameterTypes = metadata.targetSignature
      .substring(metadata.targetSignature.indexOf('(') + 1, metadata.targetSignature.indexOf(')'))
      .split(',');
    const parameters = utils.defaultAbiCoder.decode(parameterTypes, utils.hexDataSlice(targetCallData, 4));
    const rawParameters = [...parameters]; // destructuring to enforce Array shape

    return {
      targetAddress: targetContractAddress,
      value,
      rawParameters,
      parameters: stringifyBigNumbersRecursively(rawParameters),
    };
  });

  if (isGoSuccess(goResponse)) return goResponse[GO_RESULT_INDEX];
  else return null;
};

export const stringifyBigNumbersRecursively = (value: unknown): any => {
  if (BigNumber.isBigNumber(value)) return value.toString();
  else if (Array.isArray(value)) return value.map(stringifyBigNumbersRecursively);
  else return value;
};

export const encodeProposalTypeAndId = (type: ProposalType, id: string) => `${type}-${id}`;

const isValidProposalType = (type: string | undefined): type is ProposalType =>
  type === 'primary' || type === 'secondary';

export const decodeProposalTypeAndId = (typeAndId: string) => {
  const [type, id, ...rest] = typeAndId.split('-');

  if (rest.length !== 0) return null;
  if (!isValidProposalType(type)) return null;
  if (!isGoSuccess(goSync(() => BigNumber.from(id)))) return null;

  return { type: type, id: BigNumber.from(id) };
};
