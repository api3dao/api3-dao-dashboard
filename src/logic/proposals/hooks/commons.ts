import { BigNumber } from 'ethers';

export const VOTING_APP_IDS = {
  primary: 0,
  secondary: 1,
};

export const CHUNKS_SIZE = 5;

export interface StartVoteProposal {
  voteId: BigNumber;
  creator: string;
  metadata: string;
}
