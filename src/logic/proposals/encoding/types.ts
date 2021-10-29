import { ProposalType } from '../../../chain-data';

export interface NewProposalFormData {
  type: ProposalType;
  title: string;
  description: string;
  targetAddress: string;
  targetSignature: string;
  targetValue: string;
  parameters: string;
}
