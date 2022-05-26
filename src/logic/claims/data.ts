import { useCallback, useMemo, useState } from 'react';
import { BigNumber, Contract } from 'ethers';
import { go } from '@api3/promise-utils';
import { addDays } from 'date-fns';
import { blockTimestampToDate, messages } from '../../utils';
import { Claim, ClaimStatus, ClaimStatuses, updateImmutablyCurried, useChainData } from '../../chain-data';
import { notifications } from '../../components/notifications';
import { useClaimsManager, usePossibleChainDataUpdate } from '../../contracts';

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

// TODO Sort out these types after the typechain stuff (includes removing @ts-expect-error usages)
async function loadClaims(
  contract: Contract,
  params: { userAccount?: string; claimId?: BigNumber }
): Promise<{ ids: string[]; byId: Record<string, Claim> }> {
  // TODO Remove the sleep
  await sleep();

  const { userAccount = null, claimId = null } = params;
  // Get all the static data via events
  const [createdEvents, counterOfferEvents] = await Promise.all([
    // @ts-expect-error
    contract.queryFilter(contract.filters.CreatedClaim(claimId, userAccount)),
    // @ts-expect-error
    contract.queryFilter(contract.filters.ProposedSettlement(claimId, userAccount)),
  ]);

  if (!createdEvents.length) {
    return { ids: [], byId: {} };
  }

  // Get all dynamic data (status etc) via a single call
  const calls = createdEvents.map((event) => {
    return contract.interface.encodeFunctionData('claims(uint256)', [event.args!.claimIndex]);
  });
  // @ts-expect-error
  const encodedResults: string[] = await contract.callStatic.multicall(calls);
  const claims = encodedResults.map((res) => {
    return contract.interface.decodeFunctionResult('claims(uint256)', res);
  });

  // Combine the static and dynamic data
  const claimsById = createdEvents.reduce((acc, event, index) => {
    const eventArgs = event.args!;
    const claimId = eventArgs.claimIndex.toString();
    const counterOfferEvent = counterOfferEvents.find((ev) => ev.args!.claimIndex.toString() === claimId);
    const claimData = claims[index]!;

    const claim: Claim = {
      claimId,
      policyId: eventArgs.policyHash.toString(),
      evidence: eventArgs.evidence,
      timestamp: blockTimestampToDate(eventArgs.claimCreationTime),
      claimant: eventArgs.claimant,
      beneficiary: eventArgs.beneficiary,
      claimedAmount: eventArgs.claimAmount,
      counterOfferAmount: counterOfferEvent ? counterOfferEvent.args!.amount : null,
      resolvedAmount: null, // TODO
      open: true, // TODO
      status: ClaimStatuses[claimData.status as ClaimStatus],
      statusUpdatedAt: blockTimestampToDate(claimData.updateTime),
      statusUpdatedBy: 'claimant', // TODO
      deadline: null,
      transactionHash: null, // TODO
    };

    claim.deadline = calculateDeadline(claim);
    acc[claim.claimId] = claim;
    return acc;
  }, {} as Record<string, Claim>);

  return {
    ids: createdEvents.map((event) => event.args!.claimIndex.toString()),
    byId: claimsById,
  };
}

function calculateDeadline(claim: Claim) {
  switch (claim.status) {
    case 'Submitted':
    case 'MediationOffered':
    case 'Rejected':
      return addDays(claim.statusUpdatedAt, 3);
    case 'Resolved':
      if (claim.resolvedAmount !== claim.claimedAmount) {
        // Kleros came back with an amount less than the original claim, so the user has 3 days to appeal
        return addDays(claim.statusUpdatedAt, 3);
      }
      return null;
    default:
      return null;
  }
}

const sleep = () => new Promise((res) => setTimeout(res, 2000));
