import { ProposalType } from '../../../chain-data';

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
