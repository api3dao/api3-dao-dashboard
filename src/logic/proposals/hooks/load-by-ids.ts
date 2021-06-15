import { useCallback, useEffect } from 'react';
import { ProposalType, updateImmutablyCurried, useChainData } from '../../../chain-data';
import { useApi3Voting } from '../../../contracts/hooks';
import { isGoSuccess, go, GO_RESULT_INDEX } from '../../../utils';
import { getProposals, StartVoteProposal } from './get-proposals';
import { BigNumber } from '@ethersproject/bignumber';
import { notifications } from '../../../components/notifications/notifications';
import { messages } from '../../../utils/messages';

export const useLoadProposalsByIds = (type: ProposalType, ids: BigNumber[]) => {
  const api3Voting = useApi3Voting();
  const { userAccount, setChainData } = useChainData();

  const loadProposalsByIds = useCallback(async () => {
    if (!api3Voting) return;

    const votingApp = api3Voting[type];
    const startVoteFilters = ids.map((id) => votingApp.filters.StartVote(id, null, null));
    const startVotePromises = startVoteFilters.map((filter) => votingApp.queryFilter(filter));

    const goStartVoteFilters = await go(Promise.all(startVotePromises));
    if (!isGoSuccess(goStartVoteFilters)) {
      notifications.error(messages.FAILED_TO_LOAD_PROPOSALS);
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

    const loadedProposals = await getProposals(votingApp, userAccount, startVotes, type);
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
  }, [api3Voting, userAccount, setChainData, type, ids]);

  useEffect(() => {
    loadProposalsByIds();
  }, [loadProposalsByIds]);
};
