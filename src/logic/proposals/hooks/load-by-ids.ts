import { useCallback, useEffect } from 'react';
import { ProposalType, updateImmutablyCurried, useChainData, VoterState } from '../../../chain-data';
import { useApi3Voting, useConvenience, usePossibleChainDataUpdate } from '../../../contracts/hooks';
import { isGoSuccess, go, GO_RESULT_INDEX } from '../../../utils';
import { getProposals } from './get-proposals';
import { BigNumber } from '@ethersproject/bignumber';
import { notifications } from '../../../components/notifications/notifications';
import { messages } from '../../../utils/messages';
import { StartVoteProposal, VOTING_APP_IDS } from './commons';

interface DynamicVotingData {
  id: BigNumber;
  executed: boolean;
  yea: BigNumber;
  nay: BigNumber;
  voterState: number;
  // TODO: The following two are useless for proposals and it will be messy to update delegation from these hooks
  delegateAt: string;
  delegateState: number;
}

/**
 * Hook which loads proposals by ids and voting app type. It will also refetch dynamic voting data from chain after
 * every mined block.
 *
 * @param type The type of the voting app (primary or secondary)
 * @param ids Array of vote ids of proposals to be loaded
 */
// TODO: refactor the second argument to accept just a single id (the only use case for this function will be to load proposal details for a single proposal)
export const useProposalsByIds = (type: ProposalType, ids: BigNumber[]) => {
  const api3Voting = useApi3Voting();
  const convenience = useConvenience();
  const { userAccount, setChainData } = useChainData();

  const loadProposalsByIds = useCallback(async () => {
    if (!api3Voting || !convenience) return;

    const votingApp = api3Voting[type];
    const startVoteFilters = ids.map((id) => votingApp.filters.StartVote(id, null, null));
    const startVotePromises = startVoteFilters.map((filter) => votingApp.queryFilter(filter));

    const goStartVoteFilters = await go(Promise.all(startVotePromises));
    if (!isGoSuccess(goStartVoteFilters)) {
      notifications.error({ message: messages.FAILED_TO_LOAD_PROPOSALS });
      return;
    }
    const startVotes: StartVoteProposal[] = goStartVoteFilters[GO_RESULT_INDEX].map((logs) => logs[0].args).map(
      (log) => ({
        // Removing ethers array-ish response format
        creator: log.creator,
        metadata: log.metadata,
        voteId: log.voteId,
      })
    );

    const goOpenVoteIds = await go(convenience.getOpenVoteIds(VOTING_APP_IDS[type]));
    if (!isGoSuccess(goOpenVoteIds)) {
      notifications.error({ message: messages.FAILED_TO_LOAD_PROPOSALS });
      return;
    }
    const openVoteIds = goOpenVoteIds[GO_RESULT_INDEX];

    // TODO: error handling using go
    const loadedProposals = await getProposals(votingApp, convenience, userAccount, startVotes, openVoteIds, type);
    setChainData(
      'Load proposals by ids',
      updateImmutablyCurried((state) => {
        if (!state.proposals) {
          state.proposals = { primary: {}, secondary: {} };
        }

        for (const proposal of loadedProposals) {
          state.proposals[type][proposal.voteId.toString()] = proposal;
        }
      })
    );
  }, [api3Voting, convenience, userAccount, setChainData, type, ids]);

  const reloadProposalsByIds = useCallback(async () => {
    if (!convenience) return;

    // TODO: maybe batch this as well?
    const goVotingData = await go(convenience.getDynamicVoteData(VOTING_APP_IDS[type], userAccount, ids));
    if (!isGoSuccess(goVotingData)) {
      notifications.error({ message: messages.FAILED_TO_LOAD_PROPOSALS });
      return;
    }
    const rawVotingData = goVotingData[GO_RESULT_INDEX];
    let votingData: DynamicVotingData[] = [];
    for (let i = 0; i < rawVotingData.executed.length; i++) {
      votingData.push({
        id: ids[i],
        delegateAt: rawVotingData.delegateAt[i],
        delegateState: rawVotingData.delegateState[i],
        executed: rawVotingData.executed[i],
        nay: rawVotingData.nay[i],
        voterState: rawVotingData.voterState[i],
        yea: rawVotingData.yea[i],
      });
    }

    setChainData(
      'Update proposals by ids',
      updateImmutablyCurried((state) => {
        if (!state.proposals) return;

        for (const updatedProposal of votingData) {
          // NOTE: Proposal should be defined at this point
          const originalProposal = state.proposals[type][updatedProposal.id.toString()];
          state.proposals[type][updatedProposal.id.toString()] = {
            ...originalProposal,
            yea: updatedProposal.yea,
            nay: updatedProposal.nay,
            executed: updatedProposal.executed,
            voterState: updatedProposal.voterState as VoterState,
          };
        }
      })
    );
  }, [convenience, ids, userAccount, setChainData, type]);

  useEffect(() => {
    loadProposalsByIds();
  }, [loadProposalsByIds]);

  usePossibleChainDataUpdate(reloadProposalsByIds);
};
