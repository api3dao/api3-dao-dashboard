import { BigNumber } from 'ethers';
import { useCallback } from 'react';
import { ProposalType, useChainData, VoterState } from '../../chain-data';
import { Api3Voting } from '../../generated-contracts';
import { useApi3Voting, useConvenience, useOnMinedBlockAndMount } from '../../contracts/hooks';
import { Proposal } from '../../chain-data';
import { decodeMetadata } from './encoding';
import zip from 'lodash/zip';
import { isGoSuccess, blockTimestampToDate, go, GO_RESULT_INDEX, GO_ERROR_INDEX } from '../../utils';

interface StartVoteProposal {
  voteId: BigNumber;
  creator: string;
  metadata: string;
}

const getProposals = async (
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
  const PCT_BASE = await api3Voting.PCT_BASE();
  const toPercent = (value: BigNumber) => value.mul(100).div(PCT_BASE);

  const getVoteCallsInfo = (await Promise.all(startVotesInfo.map(({ voteId }) => api3Voting.getVote(voteId)))).map(
    (p) => ({
      open: p.open,
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

// TODO: error handling
export const useLoadAllProposals = () => {
  const { setChainData, userAccount, proposals } = useChainData();

  const api3Voting = useApi3Voting();
  const convenience = useConvenience();

  const loadProposalState = useCallback(async () => {
    if (!api3Voting || !convenience) return;

    // TODO: use convenience contract for this and go error handling similarly to function below
    const loadProposals = async () => {
      const { primary, secondary } = api3Voting;
      const startVoteFilter = primary.filters.StartVote(null, null, null);
      const primaryStartVotes = (await primary.queryFilter(startVoteFilter)).map((p) => p.args);
      const secondaryStartVotes = (await secondary.queryFilter(startVoteFilter)).map((p) => p.args);

      const primaryProposals = await getProposals(primary, userAccount, primaryStartVotes, 'primary');
      const secondaryProposals = await getProposals(secondary, userAccount, secondaryStartVotes, 'secondary');

      return {
        primary: primaryProposals,
        secondary: secondaryProposals,
      };
    };

    const goResponse = await go(loadProposals());
    if (isGoSuccess(goResponse)) {
      const proposals = goResponse[GO_RESULT_INDEX];

      setChainData('Load proposal state (active proposals, delegation, treasury)', {
        proposals: {
          ...proposals,
        },
      });
    } else {
      // TODO: error handling
      console.error('Unable to load proposal state', goResponse[GO_ERROR_INDEX]);
    }
  }, [api3Voting, convenience, userAccount, setChainData]);

  // Ensure that the proposals are up to date with blockchain
  useOnMinedBlockAndMount(loadProposalState);

  return proposals;
};
