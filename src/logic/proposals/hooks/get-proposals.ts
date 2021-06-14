import { BigNumber } from 'ethers';
import { ProposalType, VoterState } from '../../../chain-data';
import { Api3Voting } from '../../../generated-contracts';
import { Proposal } from '../../../chain-data';
import { decodeMetadata } from '../encoding';
import zip from 'lodash/zip';
import { blockTimestampToDate } from '../../../utils';
import { HUNDRED_PERCENT } from '../../../contracts';

export interface StartVoteProposal {
  voteId: BigNumber;
  creator: string;
  metadata: string;
}

export const getProposals = async (
  api3Voting: Api3Voting,
  userAccount: string,
  startVoteProposals: StartVoteProposal[],
  type: ProposalType
): Promise<Proposal[]> => {
  const startVotesInfo = startVoteProposals.map((p) => ({
    voteId: p.voteId,
    creator: p.creator,
    metadata: decodeMetadata(p.metadata),
  }));

  const votingTime = await api3Voting.voteTime();
  const toPercent = (value: BigNumber) => value.mul(100).div(HUNDRED_PERCENT);

  const getVoteCallsInfo = (await Promise.all(startVotesInfo.map(({ voteId }) => api3Voting.getVote(voteId)))).map(
    (p) => ({
      open: p.open,
      script: p.script,
      executed: p.executed,
      startDate: blockTimestampToDate(p.startDate),
      startDateRaw: p.startDate,
      supportRequired: toPercent(p.supportRequired),
      minAcceptQuorum: toPercent(p.minAcceptQuorum),
      yea: p.yea,
      nay: p.nay,
      votingPower: p.votingPower,
      deadline: blockTimestampToDate(p.startDate.add(votingTime)),
    })
  );

  const voterStatesInfo = await Promise.all(
    startVotesInfo.map(({ voteId }) => api3Voting.getVoterState(voteId, userAccount))
  );

  return zip(startVotesInfo, getVoteCallsInfo, voterStatesInfo).map(([startVote, getVote, voterState]) => ({
    ...startVote!,
    ...getVote!,
    voterState: voterState! as VoterState,
    type,
  }));
};
