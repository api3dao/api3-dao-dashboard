import { StartVoteEventData } from '../../chain-data';

export interface ProposalSkeleton extends StartVoteEventData {
  open: boolean;
}
