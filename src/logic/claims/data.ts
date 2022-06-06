import { useCallback, useMemo, useState } from 'react';
import { BigNumber } from 'ethers';
import { go } from '@api3/promise-utils';
import { addDays, isBefore } from 'date-fns';
import { blockTimestampToDate, messages } from '../../utils';
import { Claim, ClaimStatusCode, ClaimStatuses, updateImmutablyCurried, useChainData } from '../../chain-data';
import { notifications } from '../../components/notifications';
import { useClaimsManager, ClaimsManagerWithKlerosArbitrator, usePossibleChainDataUpdate } from '../../contracts';

export function useUserClaims() {
  const { userAccount, claims, setChainData } = useChainData();
  const claimsManager = useClaimsManager();

  const sortedClaims = useMemo(() => {
    if (!claims.userClaimIds) return null;
    // Sort by claim id in descending order
    return claims.userClaimIds
      .map((claimId) => claims.byId![claimId]!)
      .sort((a, b) => parseInt(b.claimId) - parseInt(a.claimId));
  }, [claims]);

  const [status, setStatus] = useState<'idle' | 'loading' | 'loaded' | 'failed'>('idle');
  const loadUserClaims = useCallback(async () => {
    if (!claimsManager) return;

    setStatus('loading');
    const result = await go(() => loadClaims(claimsManager, { userAccount }));

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
  }, [claimsManager, userAccount, setChainData]);

  usePossibleChainDataUpdate(loadUserClaims);

  return {
    data: sortedClaims,
    status,
  };
}

export function useUserClaimById(claimId: string) {
  const { userAccount, claims, setChainData } = useChainData();
  const claimsManager = useClaimsManager();
  const data = claims.byId?.[claimId] || null;

  const [status, setStatus] = useState<'idle' | 'loading' | 'loaded' | 'failed'>('idle');
  const loadUserClaim = useCallback(async () => {
    if (!claimsManager) return;

    setStatus('loading');
    const result = await go(() => loadClaims(claimsManager, { userAccount, claimId: BigNumber.from(claimId) }));

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
  }, [claimsManager, userAccount, claimId, setChainData]);

  usePossibleChainDataUpdate(loadUserClaim);

  return {
    data,
    status,
  };
}

async function loadClaims(
  contract: ClaimsManagerWithKlerosArbitrator,
  params: { userAccount?: string; claimId?: BigNumber }
): Promise<{ ids: string[]; byId: Record<string, Claim> }> {
  const { userAccount = null, claimId = null } = params;
  // Get all the static data via events
  const [createdEvents, counterOfferEvents] = await Promise.all([
    contract.queryFilter(contract.filters.CreatedClaim(claimId, userAccount)),
    contract.queryFilter(contract.filters.ProposedSettlement(claimId, userAccount)),
  ]);

  if (!createdEvents.length) {
    return { ids: [], byId: {} };
  }

  // Get all the dynamic data (status etc) via a single call
  const calls = createdEvents.map((event) => {
    return contract.interface.encodeFunctionData('claims', [event.args.claimIndex]);
  });
  const encodedResults = await contract.callStatic.multicall(calls);
  const claims = encodedResults.map((res) => {
    return contract.interface.decodeFunctionResult('claims', res);
  });

  // Combine the static and dynamic data
  const claimsById = createdEvents.reduce((acc, event, index) => {
    const eventArgs = event.args;
    const claimId = eventArgs.claimIndex.toString();
    const counterOfferEvent = counterOfferEvents.find((ev) => ev.args.claimIndex.toString() === claimId);
    const claimData = claims[index]!;

    const claim: Claim = {
      claimId,
      policyId: eventArgs.policyHash,
      evidence: eventArgs.evidence,
      timestamp: blockTimestampToDate(eventArgs.claimCreationTime),
      claimant: eventArgs.claimant,
      beneficiary: eventArgs.beneficiary,
      claimAmount: eventArgs.claimAmount,
      counterOfferAmount: counterOfferEvent?.args.amount ?? null,
      status: ClaimStatuses[claimData.status as ClaimStatusCode],
      statusUpdatedAt: blockTimestampToDate(claimData.updateTime),
      deadline: null,
      transactionHash: event.transactionHash,
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
  switch (claim.status) {
    case 'ClaimCreated':
    case 'SettlementProposed':
    case 'DisputeResolvedWithoutPayout':
    case 'DisputeResolvedWithSettlementPayout':
      return addDays(claim.statusUpdatedAt, 3);
    case 'DisputeCreated':
      return addDays(claim.statusUpdatedAt, 40);
    default:
      return null;
  }
}

export function isActive(claim: Claim): boolean {
  switch (claim.status) {
    case 'ClaimCreated':
      // The user has 3 days after the deadline has been reached to escalate
      return isBefore(new Date(), addDays(claim.deadline!, 3));
    case 'SettlementProposed':
      return true;
    case 'ClaimAccepted':
    case 'SettlementAccepted':
    case 'DisputeResolvedWithClaimPayout':
    case 'TimedOut':
    case 'None':
      return false;
    case 'DisputeCreated':
    case 'DisputeResolvedWithoutPayout':
    case 'DisputeResolvedWithSettlementPayout':
      return isBefore(new Date(), claim.deadline!);
  }
}
