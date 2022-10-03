import { useCallback, useEffect } from 'react';
import { Proposal, ProposalType, produceState, useChainData, VoterState } from '../../../chain-data';
import { Api3Voting } from '../../../generated-contracts';
import { useApi3Voting, useConvenience, usePossibleChainDataUpdate } from '../../../contracts/hooks';
import { messages } from '../../../utils';
import difference from 'lodash/difference';
import keyBy from 'lodash/keyBy';
import chunk from 'lodash/chunk';
import { getProposals } from './get-proposals';
import { BigNumber } from 'ethers';
import { notifications } from '../../../components/notifications';
import { openProposalIdsSelector, proposalDetailsSelector } from '../selectors';
import { CHUNKS_SIZE, StartVoteProposal, VOTING_APP_IDS } from './commons';
import { go } from '@api3/promise-utils';

const fetchStartVoteEventsForActiveProposals = async (votingApp: Api3Voting, openVoteIds: BigNumber[]) => {
  const startVoteFilter = votingApp.filters.StartVote(null, null, null);
  const startVotesLogs = (await votingApp.queryFilter(startVoteFilter))
    .map((log) => log.args)
    .map((log) => ({ voteId: log.voteId, creator: log.creator, metadata: log.metadata }));

  const openVoteIdsStr = openVoteIds.map((id) => id.toString());
  return startVotesLogs.filter((log) => openVoteIdsStr.includes(log.voteId.toString()));
};

const useLoadActiveProposals = () => {
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
        fetchStartVoteEventsForActiveProposals(api3Voting.primary, primaryOpenVoteIds),
        fetchStartVoteEventsForActiveProposals(api3Voting.secondary, secondaryOpenVoteIds),
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
      'Load active proposals',
      produceState((state) => {
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

const useReloadActiveProposals = () => {
  const { setChainData, userAccount, proposals, provider } = useChainData();

  const api3Voting = useApi3Voting();
  const convenience = useConvenience();

  const reloadActiveProposals = useCallback(async () => {
    if (!api3Voting || !convenience || !provider) return;

    const loadProposals = async () => {
      const oldActiveProposalIds = openProposalIdsSelector(proposals);

      const updateState = (type: ProposalType, loadedChunk: Proposal[]) => {
        setChainData('Update active proposals after chunk loaded', (state) =>
          produceState(state, (immutableState) => {
            const proposals = immutableState.proposals;
            // If proposals are not loaded yet, they are still being fetched at the moment
            if (!proposals) return immutableState;

            loadedChunk.forEach((proposal) => {
              proposals[type][proposal.voteId.toString()] = proposal;
            });
          })
        );
      };

      const types = ['primary', 'secondary'] as const;

      for (const type of types) {
        const previousVoteIds = oldActiveProposalIds[type] ?? [];
        const currentVoteIds = await convenience.getOpenVoteIds(VOTING_APP_IDS[type]);

        // All of the new vote ids are new proposals created in the latest block and we need to fetch metadata for them
        const newVoteIds = difference(currentVoteIds, previousVoteIds);
        // TODO: Create a function to load proposals just by vote ids and does it in parallel
        const loadNewProposals = async () => {
          const newProposalEvents: StartVoteProposal[] = [];
          for (const id of newVoteIds) {
            const startVoteFilter = api3Voting[type].filters.StartVote(id, null, null);
            const events = (await api3Voting[type].queryFilter(startVoteFilter)).map((p) => p.args);
            newProposalEvents.push(events[0]!); // There will be only one start event per voteId
          }

          // We don't expect many new proposals to be added, but we are loading as chunks just in case
          const chunks = chunk(newProposalEvents, CHUNKS_SIZE);
          for (const chunk of chunks) {
            updateState(type, await getProposals(provider, convenience, userAccount, chunk, currentVoteIds, type));
          }
        };

        // All of the old proposals have metadata already loaded, we just need to update voting state
        const oldVoteIds = difference(currentVoteIds, newVoteIds);
        const loadOldProposals = async () => {
          const voteIdsChunks = chunk(oldVoteIds, CHUNKS_SIZE); // TODO: sort by voteIds descending

          for (const chunkIds of voteIdsChunks) {
            const dynamicData = await convenience.getDynamicVoteData(VOTING_APP_IDS[type], userAccount, chunkIds);

            const updatedProposals: Proposal[] = chunkIds.map((id, index) => {
              // TODO: We assume the proposal with the given id exists (and theoretically it might not)
              const details = proposalDetailsSelector(provider, proposals, type, id);

              return {
                ...((typeof details === 'string' ? {} : details) as Proposal),
                yea: dynamicData.yea[index]!,
                nay: dynamicData.nay[index]!,
                executed: dynamicData.executed[index]!,
                voterState: dynamicData.voterState[index] as VoterState,
              };
            });

            updateState(type, updatedProposals);
          }
        };

        await loadNewProposals();
        await loadOldProposals();
      }
    };

    const goResponse = await go(loadProposals());
    if (!goResponse.success) {
      // TODO: error handling
      // eslint-disable-next-line no-console
      console.error('Unable to reload active proposals', goResponse.error);
    }
  }, [api3Voting, convenience, userAccount, setChainData, proposals, provider]);

  // Ensure that the proposals are up to date with blockchain
  usePossibleChainDataUpdate(reloadActiveProposals);
};

export const useActiveProposals = () => {
  useLoadActiveProposals();
  useReloadActiveProposals();
};
