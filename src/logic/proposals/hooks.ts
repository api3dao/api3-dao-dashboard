import { BigNumber } from 'ethers';
import { useCallback } from 'react';
import { OpenProposalIds, Proposals, ProposalType, useChainData, VoterState } from '../../chain-data';
import { Api3Voting, Convenience } from '../../generated-contracts';
import { useApi3Voting, useConvenience, useOnMinedBlockAndMount } from '../../contracts/hooks';
import { Proposal } from '../../chain-data';
import { decodeMetadata } from './encoding';
import zip from 'lodash/zip';
import { isGoSuccess, blockTimestampToDate, go, GO_RESULT_INDEX, GO_ERROR_INDEX } from '../../utils';
import { chunk, difference } from 'lodash';
import { getProposalByTypeAndIdSelector } from './selectors';

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

const reloadActiveProposalsAsChunks = async (
  api3Voting: ReturnType<typeof useApi3Voting>,
  convenience: Convenience,
  userAccount: string,
  previousOpenVoteIds: OpenProposalIds | null,
  proposals: Proposals | null,
  onChunkLoaded: (proposals: Proposal[]) => void
) => {
  if (!api3Voting || !proposals) return;

  const types = ['primary', 'secondary'] as const;

  for (const type of types) {
    const previousVoteIds = previousOpenVoteIds?.[type] ?? [];
    const currentVoteIds = await convenience.getOpenVoteIds(VOTING_APP_IDS[type]);

    // All of the new vote ids are new proposals created in the latest block and we need to fetch metadata for them
    const newVoteIds = difference(currentVoteIds, previousVoteIds);
    const loadNewProposals = async () => {
      const newProposalEvents: StartVoteProposal[] = [];
      for (const id of newVoteIds) {
        const startVoteFilter = api3Voting[type].filters.StartVote(id, null, null);
        const events = (await api3Voting[type].queryFilter(startVoteFilter)).map((p) => p.args);
        newProposalEvents.push(events[0]); // There will be only one start event per voteId
      }
      // TODO: maybe chunk this as well?
      onChunkLoaded(await getProposals(api3Voting[type], userAccount, newProposalEvents, type));
    };

    // All of the old proposals have metadata already loaded, we just need to update voting state
    const oldVoteIds = difference(currentVoteIds, previousVoteIds);
    const loadOldProposals = async () => {
      const voteIdsChunks = chunk(oldVoteIds, 5); // TODO: maybe reverse the vote ids before chunking

      for (const chunkIds of voteIdsChunks) {
        const generalData = await convenience.getGeneralVoteData(VOTING_APP_IDS[type], chunkIds);
        const userData = await convenience.getUserVoteData(VOTING_APP_IDS[type], userAccount, chunkIds);

        const updatedProposals: Proposal[] = chunkIds.map((id, index) => {
          return {
            // TODO: We assume the proposal with the given id exists (and theoretically it might not)
            ...getProposalByTypeAndIdSelector(proposals, type, id)!,
            // NOTE: these are the the only fields that could have changed for active proposal
            yea: generalData.yea[index],
            nay: generalData.nay[index],
            executed: userData.executed[index],
          };
        });

        onChunkLoaded(updatedProposals);
      }
    };

    loadNewProposals();
    loadOldProposals();
  }
};

const VOTING_APP_IDS = {
  primary: 0,
  secondary: 1,
};

export const useLoadAllProposals = () => {
  const { setChainData, userAccount, proposals } = useChainData();

  const api3Voting = useApi3Voting();
  const convenience = useConvenience();

  const loadProposals = useCallback(async () => {
    if (!api3Voting || !convenience) return;

    // TODO: use convenience contract
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
  useOnMinedBlockAndMount(loadProposals);

  return proposals;
};

export const useReloadActiveProposalsOnMinedBlock = () => {
  const { setChainData, userAccount, proposals, openProposalIds } = useChainData();

  const api3Voting = useApi3Voting();
  const convenience = useConvenience();

  const reloadActiveProposals = useCallback(async () => {
    if (!api3Voting || !convenience) return;

    const loadProposals = async () => {
      const oldActiveProposalIds = openProposalIds;

      const updateState = (loadedChunk: Proposal[]) =>
        setChainData('(Re)load active proposals after loaded chunk', (s) => {
          console.log(loadedChunk);
          // TODO: update state
          return s;
        });

      // TODO: maybe just inline this function?
      return reloadActiveProposalsAsChunks(
        api3Voting,
        convenience,
        userAccount,
        oldActiveProposalIds,
        proposals,
        updateState
      );
    };

    const goResponse = await go(loadProposals());
    if (!isGoSuccess(goResponse)) {
      // TODO: error handling
      console.error('Unable to load proposal state', goResponse[GO_ERROR_INDEX]);
    }
  }, [api3Voting, convenience, userAccount, setChainData, openProposalIds, proposals]);

  // Ensure that the proposals are up to date with blockchain
  useOnMinedBlockAndMount(reloadActiveProposals);

  return proposals;
};
