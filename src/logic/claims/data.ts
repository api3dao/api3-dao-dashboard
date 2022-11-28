import { useEffect, useMemo, useState } from 'react';
import { go } from '@api3/promise-utils';
import { addDays, addSeconds, isAfter, isBefore } from 'date-fns';
import { blockTimestampToDate, messages, sortEvents, useStableIds } from '../../utils';
import {
  Claim,
  ClaimStatuses,
  ClaimStatusCode,
  ClaimPayout,
  DisputeStatus,
  ArbitratorRulings,
  ArbitratorRulingCode,
  DisputePeriods,
  DisputePeriodCode,
  DisputePeriod,
  produceState,
  useChainData,
} from '../../chain-data';
import { notifications } from '../../components/notifications';
import {
  useClaimsManager,
  ClaimsManager,
  useChainUpdateEffect,
  KlerosLiquidProxy,
  useArbitratorProxy,
} from '../../contracts';
import { CreatedClaimEvent } from '../../contracts/tmp/ClaimsManager';
import { CreatedDisputeEvent } from '../../contracts/tmp/arbitrators/KlerosLiquidProxy';
import last from 'lodash/last';
import uniq from 'lodash/uniq';

export function useUserClaims() {
  const { userAccount, claims, setChainData } = useChainData();
  const claimsManager = useClaimsManager();
  const arbitratorProxy = useArbitratorProxy();

  const sortedClaims = useMemo(() => {
    if (!claims.userClaimIds) return null;
    // Sort by claim id in descending order
    return claims.userClaimIds
      .map((claimId) => claims.byId![claimId]!)
      .sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());
  }, [claims.userClaimIds, claims.byId]);

  const [status, setStatus] = useState<'idle' | 'loading' | 'loaded' | 'failed'>('idle');
  useChainUpdateEffect(() => {
    if (!claimsManager || !arbitratorProxy) return;

    const load = async () => {
      setStatus('loading');
      const result = await go(() => loadClaims(claimsManager, arbitratorProxy, { userAccount }));

      if (!result.success) {
        notifications.error({ message: messages.FAILED_TO_LOAD_CLAIMS, errorOrMessage: result.error });
        setStatus('failed');
        return;
      }

      setChainData(
        'Loaded claims',
        produceState((state) => {
          state.claims.userClaimIds = result.data.ids;
          state.claims.byId = { ...state.claims.byId, ...result.data.byId };
        })
      );
      setStatus('loaded');
    };

    load();
  }, [claimsManager, arbitratorProxy, userAccount, setChainData]);

  return {
    data: sortedClaims,
    status,
  };
}

/**
 * Loads both the claim and the payout data by its id. The claim will not be found if it is not linked
 * to the user's account.
 */
export function useUserClaimDataById(claimId: string) {
  const { userAccount, claims, setChainData } = useChainData();
  const claimsManager = useClaimsManager();
  const arbitratorProxy = useArbitratorProxy();

  const claim = claims.byId?.[claimId] || null;
  const payout = claims.payoutById?.[claimId] || null;

  const [status, setStatus] = useState<'idle' | 'loading' | 'loaded' | 'failed'>('idle');
  useChainUpdateEffect(() => {
    if (!claimsManager || !arbitratorProxy) return;

    const load = async () => {
      setStatus('loading');
      const result = await go(() =>
        Promise.all([
          loadClaims(claimsManager, arbitratorProxy, { userAccount, claimId }),
          loadClaimPayoutData(claimsManager, { userAccount, claimIds: [claimId] }),
        ])
      );

      if (!result.success) {
        notifications.error({ message: messages.FAILED_TO_LOAD_CLAIMS, errorOrMessage: result.error });
        setStatus('failed');
        return;
      }

      setChainData(
        'Loaded claim',
        produceState((state) => {
          state.claims.byId = { ...state.claims.byId, ...result.data[0].byId };
          state.claims.payoutById = { ...state.claims.payoutById, ...result.data[1].byId };
        })
      );
      setStatus('loaded');
    };

    load();
  }, [claimsManager, arbitratorProxy, userAccount, claimId, setChainData]);

  if (claim) {
    // If payout has executed, and we are still awaiting the payout data to load, then don't return anything
    if (hasPayoutExecuted(claim) && !payout) {
      return { claim: null, payout: null, status };
    }
  }

  return {
    claim,
    payout,
    status,
  };
}

async function loadClaims(
  claimsManager: ClaimsManager,
  arbitratorProxy: KlerosLiquidProxy,
  params: { userAccount?: string; claimId?: string }
) {
  const { userAccount = null, claimId = null } = params;
  // Get all the static data via events
  const [createdEvents, settlementEvents, disputeEvents] = await Promise.all([
    claimsManager.queryFilter(claimsManager.filters.CreatedClaim(userAccount, null, claimId)),
    claimsManager.queryFilter(claimsManager.filters.ProposedSettlement(userAccount, null, claimId)),
    arbitratorProxy.queryFilter(arbitratorProxy.filters.CreatedDispute(userAccount, null, claimId)),
  ]);

  if (!createdEvents.length) {
    return { ids: [], byId: {} };
  }

  const [claims, policies, disputes] = await Promise.all([
    getClaimContractData(claimsManager, createdEvents),
    getPolicyContractData(claimsManager, createdEvents),
    getDisputeContractData(arbitratorProxy, disputeEvents),
  ]);

  // Combine the static and dynamic data
  const claimsById = createdEvents.reduce((acc, event, index) => {
    const eventArgs = event.args;
    const claimId = eventArgs.claimHash;
    const claimData = claims[index]!;
    const settlementEvent = settlementEvents.find((ev) => ev.args.claimHash === claimId);
    const dispute = disputes.find((dispute) => dispute.claimId === claimId);
    const policy = policies.find((policy) => policy.id === eventArgs.policyHash)!;

    const claim: Claim = {
      claimId,
      evidence: eventArgs.evidence,
      timestamp: blockTimestampToDate(eventArgs.claimCreationTime),
      claimant: eventArgs.claimant,
      claimAmountInUsd: eventArgs.claimAmountInUsd,
      settlementAmountInUsd: settlementEvent?.args.settlementAmountInUsd ?? null,
      status: ClaimStatuses[claimData.status as ClaimStatusCode],
      statusUpdatedAt: blockTimestampToDate(claimData.updateTime),
      deadline: null,
      transactionHash: event.transactionHash,
      dispute: dispute || null,
      policy,
    };

    claim.deadline = calculateDeadline(claim);
    acc[claim.claimId] = claim;
    return acc;
  }, {} as Record<string, Claim>);

  return {
    ids: createdEvents.map((event) => event.args.claimHash),
    byId: claimsById,
  };
}

export function calculateDeadline(claim: Pick<Claim, 'status' | 'statusUpdatedAt' | 'dispute'>) {
  const { dispute } = claim;

  switch (claim.status) {
    case 'ClaimCreated':
    case 'SettlementProposed':
      return addDays(claim.statusUpdatedAt, 3);
    case 'DisputeCreated':
      switch (dispute?.period) {
        case 'Evidence':
          // Kleros gives their ruling after the voting period, so we get the voting period end date by adding the vote
          // period to the evidence period (the commit period is skipped because the sub court does not have hidden votes).
          return addSeconds(dispute.periodChangedAt, dispute.timesPerPeriod[0]! + dispute.timesPerPeriod[2]!);
        case 'Vote':
          return addSeconds(dispute.periodChangedAt, dispute.timesPerPeriod[2]!);
        case 'Appeal':
          return addSeconds(dispute.periodChangedAt, dispute.timesPerPeriod[3]!);
        default:
          return null;
      }
    default:
      return null;
  }
}

export function isActive(claim: Claim): boolean {
  const deadline = getCurrentDeadline(claim);
  switch (claim.status) {
    case 'DisputeCreated':
      return true;
    case 'ClaimCreated':
    case 'SettlementProposed':
      return isBefore(new Date(), deadline!);
    case 'ClaimAccepted':
    case 'SettlementAccepted':
    case 'DisputeResolvedWithClaimPayout':
    case 'DisputeResolvedWithSettlementPayout':
    case 'DisputeResolvedWithoutPayout':
    case 'None':
      return false;
  }
}

function hasPayoutExecuted(claim: Claim): boolean {
  switch (claim.status) {
    case 'ClaimAccepted':
    case 'SettlementAccepted':
    case 'DisputeResolvedWithClaimPayout':
    case 'DisputeResolvedWithSettlementPayout':
      return true;
    default:
      return false;
  }
}

export function getCurrentDeadline(claim: Claim) {
  if (claim.status === 'ClaimCreated') {
    if (isAfter(new Date(), claim.deadline!)) {
      // The user has 3 days after the deadline has been reached to escalate
      return addDays(claim.deadline!, 3);
    }
  }
  return claim.deadline;
}

type ClaimData = Awaited<ReturnType<ClaimsManager['claimHashToState']>>;

async function getClaimContractData(contract: ClaimsManager, claimEvents: CreatedClaimEvent[]) {
  const calls = claimEvents.map((event) => {
    return contract.interface.encodeFunctionData('claimHashToState', [event.args.claimHash]);
  });

  const encodedResults = await contract.callStatic.multicall(calls);

  return encodedResults.map((res) => {
    return contract.interface.decodeFunctionResult('claimHashToState', res) as ClaimData;
  });
}

export const SUB_COURT_ID = 1;

type DisputeData = Awaited<ReturnType<KlerosLiquidProxy['disputes']>>;
type SubCourt = Awaited<ReturnType<KlerosLiquidProxy['getSubcourt']>>;
type CurrentRuling = Awaited<ReturnType<KlerosLiquidProxy['currentRuling']>>;

async function getDisputeContractData(contract: KlerosLiquidProxy, disputeEvents: CreatedDisputeEvent[]) {
  const disputeCalls = disputeEvents.map((ev) => {
    return contract.interface.encodeFunctionData('disputes', [ev.args.disputeId]);
  });

  const currentRulingCalls = disputeEvents.map((ev) => {
    return contract.interface.encodeFunctionData('currentRuling', [ev.args.disputeId]);
  });

  const subCourtCall = contract.interface.encodeFunctionData('getSubcourt', [SUB_COURT_ID]);

  // Combine all calls so that we can make a single multicall
  const allCalls = [...disputeCalls, ...currentRulingCalls, subCourtCall];
  const [encodedResults, appealEvents] = await Promise.all([
    contract.callStatic.multicall(allCalls),
    getAppealEvents(contract, disputeEvents),
  ]);

  const disputes = encodedResults
    // Get the first batch of results
    .slice(0, disputeEvents.length)
    .map((res) => contract.interface.decodeFunctionResult('disputes', res) as DisputeData);

  const currentRulings = encodedResults
    // Get the second batch of results
    .slice(disputeEvents.length, 2 * disputeEvents.length)
    .map((res) => contract.interface.decodeFunctionResult('currentRuling', res) as [CurrentRuling]);

  const subCourt = contract.interface.decodeFunctionResult('getSubcourt', last(encodedResults)!) as SubCourt;

  return disputeEvents.map((ev, index) => {
    const disputeId = ev.args.disputeId.toString();
    const dispute = disputes[index]!;
    const rulingCode = currentRulings[index]?.[0]?.toNumber() as ArbitratorRulingCode;
    const appealers = appealEvents
      .filter((appealEv) => appealEv.args.disputeId.toString() === disputeId)
      .map((appealEv) => appealEv.args.sender);

    const period = DisputePeriods[dispute.period as DisputePeriodCode];
    return {
      id: disputeId,
      claimId: ev.args.claimHash,
      status: getDisputeStatus(period),
      ruling: ArbitratorRulings[rulingCode],
      period,
      periodChangedAt: blockTimestampToDate(dispute.lastPeriodChange),
      timesPerPeriod: subCourt.timesPerPeriod.map((time) => time.toNumber()),
      appealedBy: last(appealers) ?? null,
    };
  });
}

async function getAppealEvents(contract: KlerosLiquidProxy, disputeEvents: CreatedDisputeEvent[]) {
  const disputeIds = disputeEvents.map((ev) => ev.args.disputeId);
  return await contract.queryFilter(
    contract.filters.AppealedKlerosArbitratorRuling(
      null,
      // @ts-expect-error Typechain doesn't recognise that you can provide an array for any filter topic
      disputeIds
    )
  );
}

async function getPolicyContractData(contract: ClaimsManager, claimEvents: CreatedClaimEvent[]) {
  const policyIds = uniq(claimEvents.map((ev) => ev.args.policyHash));
  const metadataEvents = await contract.queryFilter(
    contract.filters.AnnouncedPolicyMetadata(
      null,
      // @ts-expect-error Typechain doesn't recognise that you can provide an array for any filter topic
      policyIds
    )
  );

  return policyIds.map((policyId) => {
    // We only care about the last event
    const metadataEvent = last(metadataEvents.filter((ev) => ev.args.policyHash === policyId));
    return {
      id: policyId,
      metadata: metadataEvent ? metadataEvent.args.metadata : 'Unknown', // We should always have a metadata event
    };
  });
}

/**
 * Based on the KlerosLiquid implementation. @see https://github.com/kleros/kleros/blob/master/contracts/kleros/KlerosLiquid.sol#L829
 */
function getDisputeStatus(period: DisputePeriod): DisputeStatus {
  switch (period) {
    case 'Evidence':
    case 'Commit':
    case 'Vote':
      return 'Waiting';
    case 'Appeal':
      return 'Appealable';
    case 'Execution':
      return 'Solved';
  }
}

export function useClaimPayoutDataPreload(claims: Claim[]) {
  const { claims: claimData, userAccount, setChainData } = useChainData();
  const claimsManager = useClaimsManager();

  const claimsToPreload = claims.filter((claim) => {
    return hasPayoutExecuted(claim) && claimData.payoutById?.[claim.claimId] == null;
  });
  const claimIds = useStableIds(claimsToPreload, (claim) => claim.claimId);

  useEffect(() => {
    if (!claimsManager || !claimIds.length) return;

    const load = async () => {
      const result = await go(() => loadClaimPayoutData(claimsManager, { userAccount, claimIds }));
      if (!result.success) return;

      setChainData(
        'Preloaded claim payout data',
        produceState((state) => {
          state.claims.payoutById = { ...state.claims.payoutById, ...result.data.byId };
        })
      );
    };

    load();
  }, [claimsManager, userAccount, claimIds, setChainData]);
}

async function loadClaimPayoutData(contract: ClaimsManager, params: { userAccount?: string; claimIds?: string[] }) {
  const { userAccount = null, claimIds = null } = params;
  const [acceptedEvents, settlementEvents, resolvedClaimEvents, resolvedSettlementEvents] = await Promise.all([
    contract.queryFilter(
      contract.filters.AcceptedClaim(
        userAccount,
        null,
        // @ts-expect-error Typechain doesn't recognise that you can provide an array for any filter topic
        claimIds
      )
    ),
    contract.queryFilter(
      contract.filters.AcceptedSettlement(
        userAccount,
        null,
        // @ts-expect-error Typechain doesn't recognise that you can provide an array for any filter topic
        claimIds
      )
    ),
    contract.queryFilter(
      contract.filters.ResolvedDisputeByAcceptingClaim(
        userAccount,
        null,
        // @ts-expect-error Typechain doesn't recognise that you can provide an array for any filter topic
        claimIds
      )
    ),
    contract.queryFilter(
      contract.filters.ResolvedDisputeByAcceptingSettlement(
        userAccount,
        null,
        // @ts-expect-error Typechain doesn't recognise that you can provide an array for any filter topic
        claimIds
      )
    ),
  ]);

  // There shouldn't ever be more than one event per claim, but we sort anyway for good measure.
  const payoutEvents = sortEvents([
    ...acceptedEvents,
    ...settlementEvents,
    ...resolvedClaimEvents,
    ...resolvedSettlementEvents,
  ] as const);

  const byId = payoutEvents.reduce((acc, ev) => {
    if ('clippedAmountInUsd' in ev.args) {
      acc[ev.args.claimHash] = {
        amountInUsd: ev.args.clippedAmountInUsd,
        amountInApi3: ev.args.clippedAmountInApi3,
        transactionHash: ev.transactionHash,
      };
    } else {
      acc[ev.args.claimHash] = {
        amountInUsd: ev.args.clippedPayoutAmountInUsd,
        amountInApi3: ev.args.clippedPayoutAmountInApi3,
        transactionHash: ev.transactionHash,
      };
    }

    return acc;
  }, {} as { [claimId: string]: ClaimPayout });

  return { byId };
}
