import { ethers } from 'ethers';
import { ProposalMetadata, ProposalType } from '../../chain-data';
import { Api3Agent } from '../../contracts';

/**
 * NOTE: Aragon contracts are flexible but this makes it a bit harder to work with it's contracts. We have created a
 * simple encoding/decoding scheme for the API3 proposals. The implementation of these utilities is inspired by
 * https://github.com/bbenligiray/proposal-test.
 */
export interface NewProposalFormData {
  type: ProposalType;
  description: string;
  targetAddress: string;
  targetSignature: string;
  targetValue: string;
  parameters: string;
}

export const encodeMetadata = (formData: NewProposalFormData) => `${formData.targetSignature} ${formData.description}`;

export const decodeMetadata = (metadata: string): ProposalMetadata => {
  const tokens = metadata.split(' ');
  return { targetSignature: tokens[0], description: tokens.slice(1).join(' ') };
};

export const encodeEvmScript = (formData: NewProposalFormData, api3Agent: Api3Agent) => {
  // We expect data to be validated at this point
  const targetParameters = JSON.parse(formData.parameters);

  // Extract the parameter types from the target function signature
  const parameterTypes = formData.targetSignature
    .substring(formData.targetSignature.indexOf('(') + 1, formData.targetSignature.indexOf(')'))
    .split(',');
  // Encode the parameters using the parameter types
  const encodedTargetParameters = ethers.utils.defaultAbiCoder.encode(parameterTypes, targetParameters);
  function encodeFunctionSignature(ethers: any, functionFragment: any) {
    return ethers.utils.hexDataSlice(ethers.utils.keccak256(ethers.utils.toUtf8Bytes(functionFragment)), 0, 4);
  }
  const encodedExecuteSignature = encodeFunctionSignature(ethers, 'execute(address,uint256,bytes)');
  // Build the call data that the EVMScript will use
  const callData =
    encodedExecuteSignature +
    ethers.utils.defaultAbiCoder
      .encode(
        ['address', 'uint256', 'bytes'],
        [
          formData.targetAddress,
          formData.targetValue,
          encodeFunctionSignature(ethers, formData.targetSignature) + encodedTargetParameters.substring(2),
        ]
      )
      .substring(2);
  // Calculate the length of the call data (in bytes) because that also goes in the EVMScript
  const callDataLengthInBytes = ethers.utils.hexZeroPad(
    ethers.BigNumber.from(callData.substring(2).length / 2).toHexString(),
    4
  );
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
  value: number;
}

export const decodeEvmScript = (script: string, metadata: ProposalMetadata): DecodedEvmScript => {
  const evmScriptPayload = ethers.utils.hexDataSlice(script, 4);
  const callData = ethers.utils.hexDataSlice(evmScriptPayload, 24);

  // https://github.com/aragon/aragon-apps/blob/631048d54b9cc71058abb8bd7c17f6738755d950/apps/agent/contracts/Agent.sol#L70
  const executionParameters = ethers.utils.defaultAbiCoder.decode(
    ['address', 'uint256', 'bytes'],
    ethers.utils.hexDataSlice(callData, 4)
  );
  const targetContractAddress = executionParameters[0];
  const value = executionParameters[1];

  // Decode the calldata
  const targetCallData = executionParameters[2];
  const parameterTypes = metadata.targetSignature
    .substring(metadata.targetSignature.indexOf('(') + 1, metadata.targetSignature.indexOf(')'))
    .split(',');
  const parameters = ethers.utils.defaultAbiCoder.decode(parameterTypes, ethers.utils.hexDataSlice(targetCallData, 4));
  const rawParameters = [...parameters]; // destructuring to enforce Array shape

  return {
    targetAddress: targetContractAddress,
    value: value.toNumber(),
    rawParameters,
    parameters: stringifyBigNumbersRecursively(rawParameters),
  };
};

export const stringifyBigNumbersRecursively = (value: unknown): any => {
  if (ethers.BigNumber.isBigNumber(value)) return value.toString();
  else if (Array.isArray(value)) return value.map(stringifyBigNumbersRecursively);
  else return value;
};

export const encodeProposalTypeAndId = (type: ProposalType, id: string) => `${type}-${id}`;

export const decodeProposalTypeAndId = (typeAndId: string) => {
  const [type, id] = typeAndId.split('-');
  return { type: type as ProposalType, id };
};
