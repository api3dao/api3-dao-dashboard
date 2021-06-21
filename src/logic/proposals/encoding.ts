import { BigNumber, utils } from 'ethers';
import { ProposalMetadata, ProposalType } from '../../chain-data';
import { Api3Agent } from '../../contracts';
import { goSync, GO_RESULT_INDEX, isGoSuccess } from '../../utils';

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

export const encodeEvmScript = (formData: NewProposalFormData, api3Agent: Api3Agent) => {
  // We expect data to be validated at this point
  const targetParameters = JSON.parse(formData.parameters);

  // Extract the parameter types from the target function signature
  const parameterTypes = formData.targetSignature
    .substring(formData.targetSignature.indexOf('(') + 1, formData.targetSignature.indexOf(')'))
    .split(',');
  // Encode the parameters using the parameter types
  const encodedTargetParameters = utils.defaultAbiCoder.encode(parameterTypes, targetParameters);
  function encodeFunctionSignature(functionFragment: any) {
    return utils.hexDataSlice(utils.keccak256(utils.toUtf8Bytes(functionFragment)), 0, 4);
  }
  const encodedExecuteSignature = encodeFunctionSignature('execute(address,uint256,bytes)');
  // Build the call data that the EVMScript will use
  const callData =
    encodedExecuteSignature +
    utils.defaultAbiCoder
      .encode(
        ['address', 'uint256', 'bytes'],
        [
          formData.targetAddress,
          utils.parseEther(formData.targetValue),
          encodeFunctionSignature(formData.targetSignature) + encodedTargetParameters.substring(2),
        ]
      )
      .substring(2);
  // Calculate the length of the call data (in bytes) because that also goes in the EVMScript
  const callDataLengthInBytes = utils.hexZeroPad(BigNumber.from(callData.substring(2).length / 2).toHexString(), 4);
  // See the EVMScript layout in
  // https://github.com/aragon/aragonOS/blob/f3ae59b00f73984e562df00129c925339cd069ff/contracts/evmscript/executors/CallsScript.sol#L26
  const evmScript =
    '0x00000001' + api3Agent[formData.type].substring(2) + callDataLengthInBytes.substring(2) + callData.substring(2);

  return evmScript;
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
