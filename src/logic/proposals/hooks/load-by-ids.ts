import { useCallback, useEffect } from 'react';
import { ProposalType, updateImmutablyCurried, useChainData, VoterState } from '../../../chain-data';
import { useApi3Voting, useConvenience, usePossibleChainDataUpdate } from '../../../contracts/hooks';
import { getProposals } from './get-proposals';
import { BigNumber } from 'ethers';
import { notifications } from '../../../components/notifications';
import { messages } from '../../../utils/messages';
import { StartVoteProposal, VOTING_APP_IDS } from './commons';
import { isZeroAddress } from '../../../contracts';
import { go } from '@api3/promise-utils';

interface DynamicVotingData {
  id: BigNumber;
  executed: boolean;
  yea: BigNumber;
  nay: BigNumber;
  voterState: number;
  delegateAt: string | null;
  delegateState: number;
}

/**
 * Hook which loads a proposal by its id and voting app type. It will also refetch dynamic voting data from chain after
 * every mined block.
 *
 * @param type The type of the voting app (primary or secondary)
 * @param id Id of the proposal to be loaded
 */
export const useProposalById = (type: ProposalType, id: BigNumber) => {
  const api3Voting = useApi3Voting();
  const convenience = useConvenience();
  const { userAccount, setChainData, provider } = useChainData();

  const loadProposalsByIds = useCallback(async () => {
    if (!api3Voting || !convenience || !provider) return;

    const votingApp = api3Voting[type];
    const startVoteFilter = votingApp.filters.StartVote(id, null, null);

    const goStartVoteFilters = await go(votingApp.queryFilter(startVoteFilter));
    if (!goStartVoteFilters.success) {
      return notifications.error({
        message: messages.FAILED_TO_LOAD_PROPOSALS,
        errorOrMessage: goStartVoteFilters.error,
      });
    }

    // There will only be at most one StartEvent response for the given filter
    const goStartVote = goStartVoteFilters.data[0];
    if (!goStartVote) {
      return notifications.error({
        message: messages.PROPOSAL_NOT_FOUND,
        errorOrMessage: messages.PROPOSAL_NOT_FOUND,
      });
    }

    const ethersArgs = goStartVote.args;
    const startVote: StartVoteProposal = {
      // Removing ethers array-ish response format
      creator: ethersArgs.creator,
      metadata: ethersArgs.metadata,
      voteId: ethersArgs.voteId,
    };

    const goOpenVoteIds = await go(convenience.getOpenVoteIds(VOTING_APP_IDS[type]));
    if (!goOpenVoteIds.success) {
      return notifications.error({
        message: messages.FAILED_TO_LOAD_PROPOSALS,
        errorOrMessage: goOpenVoteIds.error,
      });
    }
    const openVoteIds = goOpenVoteIds.data;

    const goLoadProposal = await go(getProposals(provider, convenience, userAccount, [startVote], openVoteIds, type));
    if (!goLoadProposal.success) {
      return notifications.error({
        message: messages.FAILED_TO_LOAD_PROPOSALS,
        errorOrMessage: goLoadProposal.error,
      });
    }
    const loadedProposals = goLoadProposal.data;

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
  }, [api3Voting, convenience, userAccount, setChainData, type, id, provider]);

  const reloadProposalsByIds = useCallback(async () => {
    if (!convenience) return;

    const goVotingData = await go(convenience.getDynamicVoteData(VOTING_APP_IDS[type], userAccount, [id]));
    if (!goVotingData.success) {
      return notifications.error({
        message: messages.FAILED_TO_LOAD_PROPOSALS,
        errorOrMessage: goVotingData.error,
      });
    }
    const rawVotingData = goVotingData.data;
    const votingData: DynamicVotingData = {
      id: id,
      // The rawVotingData is an object with fields that are single element arrays
      delegateAt: isZeroAddress(rawVotingData.delegateAt[0]!) ? null : rawVotingData.delegateAt[0]!,
      delegateState: rawVotingData.delegateState[0]!,
      executed: rawVotingData.executed[0]!,
      nay: rawVotingData.nay[0]!,
      voterState: rawVotingData.voterState[0]!,
      yea: rawVotingData.yea[0]!,
    };

    setChainData(
      'Update proposals by ids',
      updateImmutablyCurried((state) => {
        if (!state.proposals) return;

        const originalProposal = state.proposals[type][votingData.id.toString()];
        // NOTE: If the proposal is not defined, it is probably still being loaded
        if (!originalProposal) return;

        state.proposals[type][votingData.id.toString()] = {
          ...originalProposal,
          yea: votingData.yea,
          nay: votingData.nay,
          executed: votingData.executed,
          voterState: votingData.voterState as VoterState,
          delegateAt: votingData.delegateAt,
          delegateState: votingData.delegateState as VoterState,
        };
      })
    );
  }, [convenience, id, userAccount, setChainData, type]);

  useEffect(() => {
    loadProposalsByIds();
  }, [loadProposalsByIds]);

  // TODO: Maybe instead of avoiding `triggerOnMount` we should merge reloadProposalsByIds and loadProposalsByIds
  usePossibleChainDataUpdate(reloadProposalsByIds, { triggerOnMount: false });
};
