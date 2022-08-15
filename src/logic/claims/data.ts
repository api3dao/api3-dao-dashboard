import { useMemo, useState } from 'react';
import { BigNumber } from 'ethers';
import { go } from '@api3/promise-utils';
import { addDays, isAfter, isBefore } from 'date-fns';
import { blockTimestampToDate, messages } from '../../utils';
import {
  Claim,
  ClaimStatuses,
  ClaimStatusCode,
  DisputeStatuses,
  DisputeStatusCode,
  ArbitratorRulings,
  ArbitratorRulingCode,
  updateImmutablyCurried,
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

export function useUserClaims() {
  const { userAccount, claims, setChainData } = useChainData();
  const claimsManager = useClaimsManager();
  const arbitratorProxy = useArbitratorProxy();

  const sortedClaims = useMemo(() => {
    if (!claims.userClaimIds) return null;
    // Sort by claim id in descending order
    return claims.userClaimIds
      .map((claimId) => claims.byId![claimId]!)
      .sort((a, b) => parseInt(b.claimId) - parseInt(a.claimId));
  }, [claims]);

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
        updateImmutablyCurried((state) => {
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

export function useUserClaimById(claimId: string) {
  const { userAccount, claims, setChainData } = useChainData();
  const claimsManager = useClaimsManager();
  const arbitratorProxy = useArbitratorProxy();

  const data = claims.byId?.[claimId] || null;

  const [status, setStatus] = useState<'idle' | 'loading' | 'loaded' | 'failed'>('idle');
  useChainUpdateEffect(() => {
    if (!claimsManager || !arbitratorProxy) return;

    const load = async () => {
      setStatus('loading');
      const result = await go(() =>
        loadClaims(claimsManager, arbitratorProxy, { userAccount, claimId: BigNumber.from(claimId) })
      );

      if (!result.success) {
        notifications.error({ message: messages.FAILED_TO_LOAD_CLAIMS, errorOrMessage: result.error });
        setStatus('failed');
        return;
      }

      setChainData(
        'Loaded claim',
        updateImmutablyCurried((state) => {
          state.claims.byId = { ...state.claims.byId, ...result.data.byId };
        })
      );
      setStatus('loaded');
    };

    load();
  }, [claimsManager, arbitratorProxy, userAccount, claimId, setChainData]);

  return {
    data,
    status,
  };
}

async function loadClaims(
  claimsManager: ClaimsManager,
  arbitratorProxy: KlerosLiquidProxy,
  params: { userAccount?: string; claimId?: BigNumber }
): Promise<{ ids: string[]; byId: Record<string, Claim> }> {
  const { userAccount = null, claimId = null } = params;
  // Get all the static data via events
  const [createdEvents, counterOfferEvents, disputeEvents] = await Promise.all([
    claimsManager.queryFilter(claimsManager.filters.CreatedClaim(claimId, userAccount)),
    claimsManager.queryFilter(claimsManager.filters.ProposedSettlement(claimId, userAccount)),
    arbitratorProxy.queryFilter(arbitratorProxy.filters.CreatedDispute(claimId, userAccount)),
  ]);

  if (!createdEvents.length) {
    return { ids: [], byId: {} };
  }

  const [claims, disputes] = await Promise.all([
    getClaimContractData(claimsManager, createdEvents),
    getDisputeContractData(arbitratorProxy, disputeEvents),
  ]);

  // Combine the static and dynamic data
  const claimsById = createdEvents.reduce((acc, event, index) => {
    const eventArgs = event.args;
    const claimId = eventArgs.claimIndex.toString();
    const claimData = claims[index]!;
    const counterOfferEvent = counterOfferEvents.find((ev) => ev.args.claimIndex.toString() === claimId);
    const dispute = disputes.find((dispute) => dispute.claimIndex.toString() === claimId);

    const claim: Claim = {
      claimId,
      policyId: eventArgs.policyHash,
      evidence: eventArgs.evidence,
      timestamp: blockTimestampToDate(eventArgs.claimCreationTime),
      claimant: eventArgs.claimant,
      beneficiary: eventArgs.beneficiary,
      claimAmountInUsd: eventArgs.claimAmountInUsd,
      counterOfferAmountInUsd: counterOfferEvent?.args.amountInUsd ?? null,
      counterOfferAmountInApi3: counterOfferEvent?.args.amountInApi3 ?? null,
      status: ClaimStatuses[claimData.status as ClaimStatusCode],
      statusUpdatedAt: new Date(claimData.updateTime * 1000),
      deadline: null,
      transactionHash: event.transactionHash,
      dispute: dispute || null,
    };

    claim.deadline = calculateDeadline(claim);
    acc[claim.claimId] = claim;
    return acc;
  }, {} as Record<string, Claim>);

  return {
    ids: createdEvents.map((event) => event.args.claimIndex.toString()),
    byId: claimsById,
  };
}

function calculateDeadline(claim: Claim) {
  const { dispute } = claim;

  switch (claim.status) {
    case 'ClaimCreated':
    case 'SettlementProposed':
      return addDays(claim.statusUpdatedAt, 3);
    case 'DisputeCreated':
      if (dispute && dispute.status !== 'Waiting') {
        switch (dispute.ruling) {
          case 'DoNotPay':
          case 'PaySettlement':
            // TODO DAO-185 Calculate appeal deadline
            return addDays(claim.statusUpdatedAt, 3);
        }
      }
      return null;
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
    case 'TimedOut':
    case 'None':
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

async function getClaimContractData(contract: ClaimsManager, claimEvents: CreatedClaimEvent[]) {
  const calls = claimEvents.map((event) => {
    return contract.interface.encodeFunctionData('claims', [event.args.claimIndex]);
  });

  const encodedResults = await contract.callStatic.multicall(calls);

  return encodedResults.map((res) => {
    return contract.interface.decodeFunctionResult('claims', res);
  });
}

async function getDisputeContractData(contract: KlerosLiquidProxy, disputeEvents: CreatedDisputeEvent[]) {
  const disputeStatusCalls = disputeEvents.map((ev) => {
    return contract.interface.encodeFunctionData('disputeStatus', [ev.args.claimIndex]);
  });

  const currentRulingCalls = disputeEvents.map((ev) => {
    return contract.interface.encodeFunctionData('currentRuling', [ev.args.claimIndex]);
  });

  // Combine all calls so that we can make a single multicall
  const allCalls = [...disputeStatusCalls, ...currentRulingCalls];
  const encodedResults = await contract.callStatic.multicall(allCalls);

  const disputeStatuses = encodedResults
    // Get the first batch of results
    .slice(0, disputeEvents.length)
    .map((res) => contract.interface.decodeFunctionResult('disputeStatus', res));

  const currentRulings = encodedResults
    // Get the second batch of results
    .slice(disputeEvents.length, 2 * disputeEvents.length)
    .map((res) => contract.interface.decodeFunctionResult('currentRuling', res));

  return disputeEvents.map((ev, index) => {
    const statusCode = disputeStatuses[index]?.[0] as DisputeStatusCode;
    const rulingCode = currentRulings[index]?.[0]?.toNumber() as ArbitratorRulingCode;
    return {
      claimIndex: ev.args.claimIndex,
      id: ev.args.disputeId.toString(),
      status: DisputeStatuses[statusCode],
      ruling: ArbitratorRulings[rulingCode],
    };
  });
}
