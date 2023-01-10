import { useCallback, useEffect } from 'react';
import { updateImmutablyCurried, useChainData } from '../../../chain-data';
import { Api3Voting } from '../../../contracts/artifacts';
import { useApi3Voting, useConvenience, usePossibleChainDataUpdate } from '../../../contracts/hooks';
import { messages } from '../../../utils';
import keyBy from 'lodash/keyBy';
import { getProposals } from './get-proposals';
import { BigNumber } from 'ethers';
import { notifications } from '../../../components/notifications';
import { VOTING_APP_IDS } from './commons';
import { go } from '@api3/promise-utils';

const fetchStartVoteEventsForHistoryProposals = async (votingApp: Api3Voting, openVoteIds: BigNumber[]) => {
  const startVoteFilter = votingApp.filters.StartVote(null, null, null);
  const startVotesLogs = (await votingApp.queryFilter(startVoteFilter))
    .map((log) => log.args)
    .map((log) => ({ voteId: log.voteId, creator: log.creator, metadata: log.metadata }));

  const openVoteIdsStr = openVoteIds.map((id) => id.toString());
  return startVotesLogs.filter((log) => !openVoteIdsStr.includes(log.voteId.toString()));
};

const useLoadHistoryProposals = () => {
  const { setChainData, userAccount, provider } = useChainData();

  const api3Voting = useApi3Voting();
  const convenience = useConvenience();

  const loadProposals = useCallback(async () => {
    if (!api3Voting || !convenience || !provider) return;

    const goResponse = await go(async () => {
      const [primaryOpenVoteIds, secondaryOpenVoteIds] = await Promise.all([
        convenience.getOpenVoteIds(VOTING_APP_IDS.primary),
        convenience.getOpenVoteIds(VOTING_APP_IDS.secondary),
      ]);
      const [primaryStartVotes, secondaryStartVotes] = await Promise.all([
        fetchStartVoteEventsForHistoryProposals(api3Voting.primary, primaryOpenVoteIds),
        fetchStartVoteEventsForHistoryProposals(api3Voting.secondary, secondaryOpenVoteIds),
      ]);

      // TODO: chunk this
      const primaryProposals = await getProposals(
        provider,
        convenience,
        userAccount,
        primaryStartVotes,
        primaryOpenVoteIds,
        'primary'
      );
      const secondaryProposals = await getProposals(
        provider,
        convenience,
        userAccount,
        secondaryStartVotes,
        secondaryOpenVoteIds,
        'secondary'
      );

      return {
        primary: keyBy(primaryProposals, 'voteId'),
        secondary: keyBy(secondaryProposals, 'voteId'),
      };
    });
    if (!goResponse.success) {
      return notifications.error({
        message: messages.FAILED_TO_LOAD_PROPOSALS,
        errorOrMessage: goResponse.error,
      });
    }
    const proposals = goResponse.data;

    setChainData(
      'Load history proposals',
      updateImmutablyCurried((state) => {
        if (!state.proposals) {
          state.proposals = proposals;
          return;
        }

        state.proposals.primary = { ...state.proposals.primary, ...proposals.primary };
        state.proposals.secondary = { ...state.proposals.secondary, ...proposals.secondary };
      })
    );
  }, [api3Voting, convenience, userAccount, setChainData, provider]);

  useEffect(() => {
    loadProposals();
  }, [loadProposals]);
};

const useReloadHistoryProposals = () => {
  const { setChainData, userAccount } = useChainData();

  const api3Voting = useApi3Voting();
  const convenience = useConvenience();

  const reloadHistoryProposals = useCallback(async () => {
    if (!api3Voting || !convenience) return;

    const loadProposals = async () => {
      const [primaryOpenVoteIds, secondaryOpenVoteIds] = await Promise.all([
        convenience.getOpenVoteIds(VOTING_APP_IDS.primary),
        convenience.getOpenVoteIds(VOTING_APP_IDS.secondary),
      ]);
      const [primaryStartVotes, secondaryStartVotes] = await Promise.all([
        fetchStartVoteEventsForHistoryProposals(api3Voting.primary, primaryOpenVoteIds),
        fetchStartVoteEventsForHistoryProposals(api3Voting.secondary, secondaryOpenVoteIds),
      ]);
      const primaryHistoryVoteIds = primaryStartVotes.map((log) => log.voteId);
      const secondaryHistoryVoteIds = secondaryStartVotes.map((log) => log.voteId);
      // TODO: chunk this?
      const [primaryProposalsUpdates, secondaryProposalsUpdates] = await Promise.all([
        convenience.getDynamicVoteData(VOTING_APP_IDS.primary, userAccount, primaryHistoryVoteIds),
        convenience.getDynamicVoteData(VOTING_APP_IDS.secondary, userAccount, secondaryHistoryVoteIds),
      ]);

      setChainData(
        'Update history proposals',
        updateImmutablyCurried((immutableState) => {
          const proposals = immutableState.proposals;
          // If proposals are not loaded yet, they are still being fetched at the moment
          if (!proposals) return immutableState;

          for (let i = 0; i < primaryHistoryVoteIds.length; i++) {
            const id = primaryHistoryVoteIds[i]!.toString();
            const proposal = proposals.primary[id];
            // If proposals are not loaded yet, they are still being fetched at the moment
            if (!proposal) continue;
            proposal.executed = primaryProposalsUpdates.executed[i]!;
          }

          for (let i = 0; i < secondaryHistoryVoteIds.length; i++) {
            const id = secondaryHistoryVoteIds[i]!.toString();
            const proposal = proposals.secondary[id];
            // If proposals are not loaded yet, they are still being fetched at the moment
            if (!proposal) continue;
            proposal.executed = secondaryProposalsUpdates.executed[i]!;
          }
        })
      );
    };

    const goResponse = await go(loadProposals());
    if (!goResponse.success) {
      return notifications.error({
        message: messages.FAILED_TO_LOAD_PROPOSALS,
        errorOrMessage: goResponse.error,
      });
    }
  }, [api3Voting, convenience, userAccount, setChainData]);

  // Ensure that the proposals are up to date with blockchain
  usePossibleChainDataUpdate(reloadHistoryProposals);
};

export const useHistoryProposals = () => {
  useLoadHistoryProposals();
  useReloadHistoryProposals();
};
