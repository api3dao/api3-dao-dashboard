import { ethers } from 'ethers';
import { ProposalMetadata, ProposalType } from '../../chain-data';
import { Api3Agent } from '../../contracts';

export interface NewProposalFormData {
  type: ProposalType;
  description: string;
  targetAddress: string;
  targetSignature: string;
  targetValue: string;
  parameters: string;
}

export const decodeMetadata = (metadata: string): ProposalMetadata => {
  const tokens = metadata.split(' ');
  return { targetSignature: tokens[0], description: tokens.slice(1).join(' ') };
};

// Note that we're prepending `targetFunctionSignature` to the start of the metadata.
// This is because we need the target function signature to decode the EVMScript to
// display the parameters at the client. See read-proposal.js for more details.
// If we implement EVMScript that specifies multiple calls, we can simply prepend those
// signatures as well (i.e., `${targetFunctionSignature1} ${targetFunctionSignature2} ${metadata}`, etc.)
// So this convention is future-proof.
export const buildExtendedMetadata = (formData: NewProposalFormData) =>
  `${formData.targetSignature} ${formData.description}`;

export const buildEVMScript = (formData: NewProposalFormData, api3Agent: Api3Agent) => {
  // NOTE: We expect data to be validated at this point
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
  // See the EVMScript layout here
  // https://github.com/aragon/aragonOS/blob/f3ae59b00f73984e562df00129c925339cd069ff/contracts/evmscript/executors/CallsScript.sol#L26
  // Note that evmScripts can also be specified to execute multiple transactions. We may
  // want to support that later on.
  const evmScript =
    '0x00000001' + api3Agent[formData.type].substring(2) + callDataLengthInBytes.substring(2) + callData.substring(2);

  return evmScript;
};

export const encodeProposalTypeAndId = (type: ProposalType, id: string) => `${type}-${id}`;
export const decodeProposalTypeAndId = (typeAndId: string) => {
  const [type, id] = typeAndId.split('-');
  return { type: type as ProposalType, id };
};
