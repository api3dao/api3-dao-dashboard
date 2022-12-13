import { useMemo, useState } from 'react';
import { BigNumber } from 'ethers';
import { go } from '@api3/promise-utils';
import {
  EPOCH_LENGTH,
  HUNDRED_PERCENT,
  isZeroAddress,
  useApi3Voting,
  useChainUpdateEffect,
  useConvenience,
} from '../../contracts';
import {
  ChainData,
  Proposal,
  ProposalType,
  StartVoteEventData,
  VoteData,
  VoterState,
  produceState,
  useChainData,
} from '../../chain-data';
import { decodeEvmScript, decodeMetadata } from './encoding';
import { blockTimestampToDate, messages, sortEvents, useStableIds } from '../../utils';
import { notifications } from '../../components/notifications';
import { usePagedData } from '../../components/pagination';
import { Convenience } from '../../generated-contracts';
import { StartVoteEvent } from '../../generated-contracts/Api3Voting';
import { ProposalSkeleton } from './types';

const VOTING_APP_IDS = {
  primary: 0,
  secondary: 1,
};

/**
 * Loads all the StartVote events and the open vote IDs for both primary and secondary proposals.
 *
 * With this data loaded, we have the necessary data to show a paged list of proposal skeletons (for
 * both active and past proposal lists).
 */
export function useProposalBaseData() {
  const api3Voting = useApi3Voting();
  const convenience = useConvenience();
  const { setChainData, proposals, provider } = useChainData();
  const [status, setStatus] = useState<'idle' | 'loading' | 'loaded' | 'failed'>('idle');

  useChainUpdateEffect(() => {
    if (!api3Voting || !convenience) return;

    let isLatest = true;

    const load = async () => {
      setStatus('loading');
      const result = await go(() =>
        Promise.all([
          api3Voting.primary.queryFilter(api3Voting.primary.filters.StartVote()),
          api3Voting.secondary.queryFilter(api3Voting.secondary.filters.StartVote()),
          convenience.getOpenVoteIds(VOTING_APP_IDS.primary),
          convenience.getOpenVoteIds(VOTING_APP_IDS.secondary),
        ])
      );

      if (!isLatest) return;
      if (!result.success) {
        notifications.error({ message: messages.FAILED_TO_LOAD_PROPOSALS, errorOrMessage: result.error });
        setStatus('failed');
        return;
      }

      const [primaryEvents, secondaryEvents, primaryOpenVoteIds, secondaryOpenVoteIds] = result.data;
      const processedPrimaryEvents = processStartVoteEvents('primary', primaryEvents);
      const processedSecondaryEvents = processStartVoteEvents('secondary', secondaryEvents);

      setChainData(
        'Loaded proposal base data',
        produceState((draft) => {
          draft.proposals.primary.voteIds = processedPrimaryEvents.map((ev) => ev.voteId);
          draft.proposals.primary.openVoteIds = primaryOpenVoteIds.map((id) => id.toString());
          processedPrimaryEvents.forEach((ev) => {
            draft.proposals.primary.startVoteEventDataById[ev.voteId] = ev;
          });

          draft.proposals.secondary.voteIds = processedSecondaryEvents.map((ev) => ev.voteId);
          draft.proposals.secondary.openVoteIds = secondaryOpenVoteIds.map((id) => id.toString());
          processedSecondaryEvents.forEach((ev) => {
            draft.proposals.secondary.startVoteEventDataById[ev.voteId] = ev;
          });
        })
      );
      setStatus('loaded');
    };

    load();

    return () => {
      isLatest = false;
    };
  }, [api3Voting, convenience, setChainData, provider]);

  return { status, data: proposals };
}

interface ProposalFilter {
  open: boolean;
  type?: 'primary' | 'secondary' | 'none' | null;
}

/**
 * Uses the proposal base data, the current page number, and proposal filter to determine the paged list of proposals
 * to show and to load additional vote data for. While each proposal's additional vote data is busy loading, a
 * ProposalSkeleton will be returned in its place that includes the proposal's metadata.
 *
 * Note: We deliberately omit:
 * - decoding the EVM script
 * - loading the ENS name for the proposal creator
 *
 * We omit the above items because they aren't required on the proposal lists and have a considerable performance impact.
 */
export function useProposals(currentPage: number, filter: ProposalFilter) {
  const convenience = useConvenience();
  const { proposals, userAccount, setChainData } = useChainData();

  const { status: baseDataStatus } = useProposalBaseData();
  const [status, setStatus] = useState<'idle' | 'loading' | 'loaded' | 'failed'>('idle');

  const combinedStartVoteData = getCombinedStartVoteEventData(proposals, filter);
  const pagedStartVoteData = usePagedData(combinedStartVoteData, { currentPage });

  const primaryVoteIdsToLoad = useStableIds(
    pagedStartVoteData.filter((ev) => ev.type === 'primary'),
    (ev) => ev.voteId
  );
  const secondaryVoteIdsToLoad = useStableIds(
    pagedStartVoteData.filter((ev) => ev.type === 'secondary'),
    (ev) => ev.voteId
  );

  useChainUpdateEffect(() => {
    if (!convenience || (!primaryVoteIdsToLoad.length && !secondaryVoteIdsToLoad.length)) return;

    let isLatest = true;

    const load = async () => {
      setStatus('loading');
      const result = await go(() =>
        Promise.all([
          getVoteData('primary', primaryVoteIdsToLoad, convenience, userAccount),
          getVoteData('secondary', secondaryVoteIdsToLoad, convenience, userAccount),
        ])
      );

      if (!isLatest) return;
      if (!result.success) {
        notifications.error({ message: messages.FAILED_TO_LOAD_PROPOSALS, errorOrMessage: result.error });
        setStatus('failed');
        return;
      }

      setChainData(
        'Loaded vote data',
        produceState((draft) => {
          result.data[0].forEach((data) => {
            draft.proposals.primary.voteDataById[data.voteId] = data;
          });
          result.data[1].forEach((data) => {
            draft.proposals.secondary.voteDataById[data.voteId] = data;
          });
        })
      );
      setStatus('loaded');
    };

    load();

    return () => {
      isLatest = false;
    };
  }, [convenience, userAccount, primaryVoteIdsToLoad, secondaryVoteIdsToLoad, setChainData]);

  // If we don't yet have vote IDs, then the proposal base data has not yet successfully loaded
  if (proposals.primary.voteIds == null) {
    return {
      status: baseDataStatus,
      totalResults: 0,
      data: null,
    };
  }

  const data: (ProposalSkeleton | Proposal)[] = pagedStartVoteData.map((startVote) => {
    const voteData = proposals[startVote.type].voteDataById[startVote.voteId];

    return { open: filter.open, ...startVote, ...voteData };
  });

  return {
    status,
    totalResults: combinedStartVoteData.length,
    data,
  };
}

/**
 * Fully loads the proposal by type and vote ID. It only returns data once all the pieces that make up the
 * proposal is loaded. This includes the decoding of the EVM script.
 */
export function useProposalById(type: ProposalType, voteId: string) {
  const api3Voting = useApi3Voting();
  const convenience = useConvenience();

  const { proposals, userAccount, setChainData, provider } = useChainData();

  const [status, setStatus] = useState<'idle' | 'loading' | 'loaded' | 'failed'>('idle');

  const startVoteData = proposals[type].startVoteEventDataById[voteId];
  const voteData = proposals[type].voteDataById[voteId];
  const decodedEvmScript = proposals[type].decodedEvmScriptById[voteId];
  const openVoteIds = proposals[type].openVoteIds;

  useChainUpdateEffect(() => {
    if (!provider || !api3Voting || !convenience) return;

    let isLatest = true;

    const load = async () => {
      setStatus('loading');
      const result = await go(async () => {
        const votingContract = api3Voting[type];

        return Promise.all([
          votingContract.queryFilter(votingContract.filters.StartVote(BigNumber.from(voteId))),
          convenience.getOpenVoteIds(VOTING_APP_IDS[type]),
          // We use the promise util for this vote data call because the call fails when provided with a vote ID
          // that does not exist, and we want it to fail silently in that case.
          go(getVoteData(type, [voteId], convenience, userAccount)),
        ]);
      });

      if (!isLatest) return;
      if (!result.success) {
        notifications.error({ message: messages.FAILED_TO_LOAD_PROPOSALS, errorOrMessage: result.error });
        setStatus('failed');
        return;
      }

      const [events, openIds, voteDataResult] = result.data;
      const processedEvents = processStartVoteEvents(type, events);
      // We can end up with no events if the given vote ID does not exist, or if the decoded metadata is null.
      if (!processedEvents.length) {
        setStatus('loaded');
        return;
      }

      if (!voteDataResult.success) {
        notifications.error({ message: messages.FAILED_TO_LOAD_PROPOSALS, errorOrMessage: voteDataResult.error });
        setStatus('failed');
        return;
      }

      const startVote = processedEvents[0]!;
      const voteData = voteDataResult.data[0]!;
      const decodedEvmScript = await decodeEvmScript(provider, voteData.script, startVote.metadata);

      setChainData(
        'Loaded proposal by id',
        produceState((draft) => {
          draft.proposals[type].openVoteIds = openIds.map((id) => id.toString());
          draft.proposals[type].startVoteEventDataById[voteId] = startVote;
          draft.proposals[type].voteDataById[voteId] = voteData;
          draft.proposals[type].decodedEvmScriptById[voteId] = decodedEvmScript;
        })
      );
      setStatus('loaded');
    };

    load();
    return () => {
      isLatest = false;
    };
  }, [provider, api3Voting, convenience, userAccount, setChainData, type, voteId]);

  const data: Proposal | null = useMemo(() => {
    return startVoteData && voteData && decodedEvmScript !== undefined
      ? {
          ...startVoteData,
          ...voteData,
          decodedEvmScript,
          open: openVoteIds.includes(startVoteData.voteId),
        }
      : null;
  }, [startVoteData, voteData, decodedEvmScript, openVoteIds]);

  return { data, status };
}

/**
 * Transforms StartVote event data into a form that is easier to consume, and filters out entries whose
 * metadata decodes to null.
 */
function processStartVoteEvents(type: ProposalType, events: StartVoteEvent[]) {
  return events.reduce((acc, ev) => {
    const metadata = decodeMetadata(ev.args.metadata);

    if (metadata) {
      acc.push({
        type,
        voteId: ev.args.voteId.toString(),
        creator: ev.args.creator,
        metadata,
        blockNumber: ev.blockNumber,
        logIndex: ev.logIndex,
      });
    }

    return acc;
  }, [] as StartVoteEventData[]);
}

function getCombinedStartVoteEventData(data: ChainData['proposals'], filter: ProposalFilter) {
  const primaryLog =
    !filter.type || filter.type === 'primary'
      ? (data.primary.voteIds || [])
          .filter((id) => data.primary.openVoteIds.includes(id) === filter.open)
          .map((id) => data.primary.startVoteEventDataById[id]!)
      : [];

  const secondaryLog =
    !filter.type || filter.type === 'secondary'
      ? (data.secondary.voteIds || [])
          .filter((id) => data.secondary.openVoteIds.includes(id) === filter.open)
          .map((id) => data.secondary.startVoteEventDataById[id]!)
      : [];

  return sortEvents([...primaryLog, ...secondaryLog], 'desc');
}

async function getVoteData(
  type: ProposalType,
  voteIds: string[],
  convenience: Convenience,
  userAccount: string
): Promise<VoteData[]> {
  if (!voteIds.length) return [];

  const [staticVoteData, dynamicVoteData] = await Promise.all([
    convenience.getStaticVoteData(VOTING_APP_IDS[type], userAccount, voteIds),
    convenience.getDynamicVoteData(VOTING_APP_IDS[type], userAccount, voteIds),
  ]);

  return voteIds.map((voteId, i) => {
    return {
      voteId,
      script: staticVoteData.script[i]!,

      startDate: blockTimestampToDate(staticVoteData.startDate[i]!),
      startDateRaw: staticVoteData.startDate[i]!,
      deadline: blockTimestampToDate(staticVoteData.startDate[i]!.add(EPOCH_LENGTH)),
      supportRequired: toPercent(staticVoteData.supportRequired[i]!),
      minAcceptQuorum: toPercent(staticVoteData.minAcceptQuorum[i]!),
      votingPower: staticVoteData.votingPower[i]!,
      userVotingPowerAt: staticVoteData.userVotingPowerAt[i]!,

      delegateAt: isZeroAddress(dynamicVoteData.delegateAt[i]!) ? null : dynamicVoteData.delegateAt[i]!,
      delegateState: dynamicVoteData.delegateState[i] as VoterState,
      voterState: dynamicVoteData.voterState[i] as VoterState,
      executed: dynamicVoteData.executed[i]!,
      yea: dynamicVoteData.yea[i]!,
      nay: dynamicVoteData.nay[i]!,
    };
  });
}

const toPercent = (value: BigNumber) => value.mul(100).div(HUNDRED_PERCENT).toNumber();
