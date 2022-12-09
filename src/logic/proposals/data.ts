import { useMemo, useState } from 'react';
import {
  EPOCH_LENGTH,
  HUNDRED_PERCENT,
  isZeroAddress,
  useApi3Voting,
  useChainUpdateEffect,
  useConvenience,
} from '../../contracts';
import { VOTING_APP_IDS } from './hooks/commons';
import {
  ChainData,
  produceState,
  Proposal,
  ProposalType,
  StartVoteEventData,
  useChainData,
  VoteData,
  VoterState,
} from '../../chain-data';
import { decodeEvmScript, decodeMetadata } from './encoding';
import { BigNumber } from 'ethers';
import { blockTimestampToDate, sortEvents, useStableIds } from '../../utils';
import { usePagedData } from '../../components/pagination';
import { Convenience } from '../../generated-contracts';
import { go } from '@api3/promise-utils';
import { StartVoteEvent } from '../../generated-contracts/Api3Voting';

export function useProposalBaseData() {
  const api3Voting = useApi3Voting();
  const convenience = useConvenience();
  const { setChainData, proposalData, provider } = useChainData();
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
        setStatus('failed');
        return;
      }

      const [primaryEvents, secondaryEvents, primaryOpenVoteIds, secondaryOpenVoteIds] = result.data;
      const processedPrimaryEvents = processStartVoteEvents('primary', primaryEvents);
      const processedSecondaryEvents = processStartVoteEvents('secondary', secondaryEvents);

      setChainData(
        'Loaded proposal base data',
        produceState((draft) => {
          draft.proposalData.primary.voteIds = processedPrimaryEvents.map((ev) => ev.voteId);
          draft.proposalData.primary.openVoteIds = primaryOpenVoteIds.map((id) => id.toString());
          processedPrimaryEvents.forEach((ev) => {
            draft.proposalData.primary.startVoteEventDataById[ev.voteId] = ev;
          });

          draft.proposalData.secondary.voteIds = processedSecondaryEvents.map((ev) => ev.voteId);
          draft.proposalData.secondary.openVoteIds = secondaryOpenVoteIds.map((id) => id.toString());
          processedSecondaryEvents.forEach((ev) => {
            draft.proposalData.secondary.startVoteEventDataById[ev.voteId] = ev;
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

  return { status, data: proposalData };
}

type Filter = {
  open: boolean;
  type?: 'primary' | 'secondary' | 'none' | null;
};

export type ProposalSkeleton = { open: boolean } & StartVoteEventData;

export function useProposals(currentPage: number, filter: Filter) {
  const convenience = useConvenience();
  const { proposalData, userAccount, setChainData } = useChainData();

  const { status: baseDataStatus } = useProposalBaseData();
  const [status, setStatus] = useState<'idle' | 'loading' | 'loaded' | 'failed'>('idle');

  const combinedStartVoteData = getCombinedStartVoteEventData(proposalData, filter);
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
        setStatus('failed');
        return;
      }

      setChainData(
        'Loaded vote details',
        produceState((draft) => {
          result.data[0].forEach((data) => {
            draft.proposalData.primary.voteDataById[data.voteId] = data;
          });
          result.data[1].forEach((data) => {
            draft.proposalData.secondary.voteDataById[data.voteId] = data;
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

  if (proposalData.primary.voteIds == null) {
    return {
      status: baseDataStatus,
      totalResults: 0,
      data: null,
    };
  }

  const data: (ProposalSkeleton | Proposal)[] = pagedStartVoteData.map((startVote) => {
    const voteData = proposalData[startVote.type].voteDataById[startVote.voteId];

    return { open: filter.open, ...startVote, ...voteData };
  });

  return {
    status,
    totalResults: combinedStartVoteData.length,
    data,
  };
}

export function useProposalById(type: ProposalType, voteId: string) {
  const api3Voting = useApi3Voting();
  const convenience = useConvenience();

  const { proposalData, userAccount, setChainData, provider } = useChainData();

  const [status, setStatus] = useState<'idle' | 'loading' | 'loaded' | 'failed'>('idle');

  const startVoteData = proposalData[type].startVoteEventDataById[voteId];
  const voteData = proposalData[type].voteDataById[voteId];
  const decodedEvmScript = proposalData[type].decodedEvmScriptById[voteId];
  const openVoteIds = proposalData[type].openVoteIds;

  useChainUpdateEffect(() => {
    if (!provider || !api3Voting || !convenience) return;

    let isLatest = true;

    const load = async () => {
      setStatus('loading');
      const result = await go(() =>
        Promise.all([
          api3Voting[type].queryFilter(api3Voting[type].filters.StartVote(BigNumber.from(voteId))),
          convenience.getOpenVoteIds(VOTING_APP_IDS[type]),
          getVoteData(type, [voteId], convenience, userAccount),
        ])
      );

      if (!result.success) {
        setStatus('failed');
        return;
      }

      const [events, openIds, voteData] = result.data;
      const processedEvents = processStartVoteEvents(type, events);
      if (!processedEvents.length) {
        setStatus('loaded');
        return;
      }

      const startVote = processedEvents[0]!;
      const decResult = await go(() => decodeEvmScript(provider, voteData[0]!.script, startVote.metadata));

      if (!decResult.success) {
        setStatus('failed');
        return;
      }

      if (!isLatest) return;

      setChainData(
        'Loaded proposal by id',
        produceState((draft) => {
          draft.proposalData[type].openVoteIds = openIds.map((id) => id.toString());
          draft.proposalData[type].startVoteEventDataById[voteId] = startVote;
          draft.proposalData[type].voteDataById[voteId] = voteData[0]!;
          draft.proposalData[type].decodedEvmScriptById[voteId] = decResult.data;
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

function getCombinedStartVoteEventData(data: ChainData['proposalData'], filter: Filter) {
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
      supportRequired: toPercent(staticVoteData.supportRequired[i]!),
      minAcceptQuorum: toPercent(staticVoteData.minAcceptQuorum[i]!),
      votingPower: staticVoteData.votingPower[i]!,
      deadline: blockTimestampToDate(staticVoteData.startDate[i]!.add(EPOCH_LENGTH)),
      startDateRaw: staticVoteData.startDate[i]!,
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
