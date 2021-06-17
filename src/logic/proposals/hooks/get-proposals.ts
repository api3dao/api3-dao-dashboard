import { BigNumber } from 'ethers';
import { ProposalType, VoterState } from '../../../chain-data';
import { Api3Voting, Convenience } from '../../../generated-contracts';
import { Proposal } from '../../../chain-data';
import { decodeMetadata } from '../encoding';
import { blockTimestampToDate } from '../../../utils';
import { HUNDRED_PERCENT } from '../../../contracts';
import { StartVoteProposal, VOTING_APP_IDS } from './commons';

const toPercent = (value: BigNumber) => value.mul(100).div(HUNDRED_PERCENT);

export const getProposals = async (
  api3Voting: Api3Voting,
  convenience: Convenience,
  userAccount: string,
  startVoteProposals: StartVoteProposal[],
  openVoteIds: BigNumber[],
  type: ProposalType
): Promise<Proposal[]> => {
  const startVotesInfo = startVoteProposals.map((p) => ({
    ...p,
    metadata: decodeMetadata(p.metadata),
  }));

  // TODO: load this just once for all proposals and save to state
  const votingTime = await api3Voting.voteTime();

  const voteIdsToLoad = startVotesInfo.map((log) => log.voteId);
  const openVoteIdsStr = openVoteIds.map((id) => id.toString());
  const staticVoteData = await convenience.getStaticVoteData(VOTING_APP_IDS[type], userAccount, voteIdsToLoad);
  const dynamicVoteData = await convenience.getDynamicVoteData(VOTING_APP_IDS[type], userAccount, voteIdsToLoad);

  const proposals: Proposal[] = [];
  for (let i = 0; i < startVoteProposals.length; i++) {
    proposals.push({
      type,
      ...startVotesInfo[i]!,
      open: openVoteIdsStr.includes(startVotesInfo[i]!.voteId.toString()),

      startDate: blockTimestampToDate(staticVoteData.startDate[i]!),
      supportRequired: toPercent(staticVoteData.supportRequired[i]!),
      minAcceptQuorum: toPercent(staticVoteData.minAcceptQuorum[i]!),
      votingPower: staticVoteData.votingPower[i]!,
      deadline: blockTimestampToDate(staticVoteData.startDate[i]!.add(votingTime)),
      startDateRaw: staticVoteData.startDate[i]!,
      script: staticVoteData.script[i]!,
      userVotingPowerAt: staticVoteData.userVotingPowerAt[i]!,

      voterState: dynamicVoteData.voterState[i] as VoterState,
      executed: dynamicVoteData.executed[i]!,
      yea: dynamicVoteData.yea[i]!,
      nay: dynamicVoteData.nay[i]!,
    });
  }

  return proposals;
};
