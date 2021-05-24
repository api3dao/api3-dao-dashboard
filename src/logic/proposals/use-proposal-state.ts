import { useCallback, useEffect } from 'react';
import { ProposalType, updateImmutably, useChainData, VoterState } from '../../chain-data';
import { Api3Voting } from '../../generated-contracts';
import { useApi3Pool, useApi3Voting } from '../../contracts/hooks';
import { Proposal } from '../../chain-data';
import { decodeMetadata } from './encoding';
import zip from 'lodash/zip';
import { BigNumber } from '@ethersproject/bignumber';
import { blockTimestampToDate } from '../../utils/generic';

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
export const useProposalState = () => {
  const { setChainData, userAccount, proposalState } = useChainData();

  const api3Voting = useApi3Voting();
  const api3Pool = useApi3Pool();

  const loadInitialData = useCallback(async () => {
    if (!api3Voting || !api3Pool) return;

    const { primary, secondary } = api3Voting;
    const startVoteFilter = primary.filters.StartVote(null, null, null);
    const primaryStartVotes = (await primary.queryFilter(startVoteFilter)).map((p) => p.args);
    const secondaryStartVotes = (await secondary.queryFilter(startVoteFilter)).map((p) => p.args);

    setChainData({
      proposalState: {
        delegationAddress: await api3Pool.getUserDelegate(userAccount),
        primary: {
          proposals: await getProposals(primary, userAccount, primaryStartVotes, 'primary'),
        },
        secondary: {
          proposals: await getProposals(secondary, userAccount, secondaryStartVotes, 'secondary'),
        },
      },
    });
  }, [api3Voting, userAccount, setChainData, api3Pool]);

  useEffect(() => {
    loadInitialData();
  }, [loadInitialData]);

  // Ensure that the proposals are up to date with blockchain
  useEffect(() => {
    if (!api3Voting || !proposalState) return;

    type Api3VotingFilters = typeof api3Voting.primary.filters;
    type Api3VotingFiltersMap = { [key in keyof Api3VotingFilters]: ReturnType<Api3VotingFilters[key]> };
    // Let's enforce we list out every Api3Voting event to make it harder to forget process some.
    // NOTE: We want to load all proposals, not just the ones from current user
    const votingEvents: Api3VotingFiltersMap = {
      CastVote: api3Voting.primary.filters.CastVote(null, null, null, null),
      ChangeMinQuorum: api3Voting.primary.filters.ChangeMinQuorum(null),
      ChangeSupportRequired: api3Voting.primary.filters.ChangeSupportRequired(null),
      ExecuteVote: api3Voting.primary.filters.ExecuteVote(null),
      StartVote: api3Voting.primary.filters.StartVote(null, null, null),
      // Filters below are not used at the moment.
      ScriptResult: api3Voting.primary.filters.ScriptResult(null, null, null, null),
      RecoverToVault: api3Voting.primary.filters.RecoverToVault(null, null, null),
    };
    const votingAppTypes = ['primary', 'secondary'] as const;

    // For other events just reload everything
    const reloadEverything = loadInitialData;
    votingAppTypes.forEach((type) => {
      const votingApp = api3Voting[type];

      votingApp.on(votingEvents.StartVote, reloadEverything);
      votingApp.on(votingEvents.CastVote, reloadEverything);
      votingApp.on(votingEvents.ChangeMinQuorum, reloadEverything);
      votingApp.on(votingEvents.ChangeSupportRequired, reloadEverything);
      votingApp.on(votingEvents.ExecuteVote, reloadEverything);
    });

    return () => {
      votingAppTypes.forEach((type) => {
        const votingApp = api3Voting[type];

        votingApp.removeListener(votingEvents.StartVote, reloadEverything);
        votingApp.removeListener(votingEvents.CastVote, reloadEverything);
        votingApp.removeListener(votingEvents.ChangeMinQuorum, reloadEverything);
        votingApp.removeListener(votingEvents.ChangeSupportRequired, reloadEverything);
        votingApp.removeListener(votingEvents.ExecuteVote, reloadEverything);
      });
    };
  }, [userAccount, proposalState, api3Voting, setChainData, loadInitialData]);

  useEffect(() => {
    if (!api3Pool) return;

    const delegationEvents = {
      Delegated: api3Pool.filters.Delegated(userAccount, null),
      Undelegated: api3Pool.filters.Undelegated(userAccount, null),
    };

    Object.values(delegationEvents).forEach((filter) => {
      api3Pool.on(filter, async () => {
        const newDelegationAddress = await api3Pool.userDelegate(userAccount);

        setChainData((data) =>
          updateImmutably(data, (data) => {
            data.proposalState!.delegationAddress = newDelegationAddress;
          })
        );
      });
    });

    return () => {
      Object.keys(delegationEvents).forEach((eventName) => {
        api3Pool.removeAllListeners(eventName);
      });
    };
  }, [api3Pool, userAccount, setChainData]);

  return proposalState;
};
