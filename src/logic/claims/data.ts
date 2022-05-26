import { useCallback, useMemo, useState } from 'react';
import { BigNumber } from 'ethers';
import { go } from '@api3/promise-utils';
import { addDays } from 'date-fns';
import { blockTimestampToDate, messages } from '../../utils';
import { Claim, ClaimStatus, ClaimStatuses, updateImmutablyCurried, useChainData } from '../../chain-data';
import { notifications } from '../../components/notifications';
import { useClaimsManager, usePossibleChainDataUpdate } from '../../contracts';

export function useUserClaims() {
  const { userAccount, claims, setChainData } = useChainData();
  const claimsManager = useClaimsManager();

  // useEffect(() => {
  //   if (!claimsManager) return;
  //
  //   async function testMulticall() {
  //     // @ts-ignore
  //     const filter = claimsManager.filters.CreatedClaim(null, userAccount);
  //     // @ts-ignore
  //     const createdEvents = await claimsManager.queryFilter(filter);
  //     const calls = createdEvents.map((event) =>
  //       // @ts-ignore
  //       claimsManager.interface.encodeFunctionData('getClaim(uint256)', [event.args.claimIndex])
  //     );
  //     if (calls.length) {
  //       // @ts-ignore
  //       await claimsManager.multicall(calls);
  //     }
  //   }
  //
  //   testMulticall();
  // }, []);

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
    const result = await go(async () => {
      // @ts-ignore
      const filter = claimsManager.filters.CreatedClaim(null, userAccount);
      // @ts-ignore
      const createdEvents = await claimsManager.queryFilter(filter);
      const userClaimIds = createdEvents.map((event) => event.args!.claimIndex.toString());
      const claimsById = await loadClaimsByCreatedEvents(claimsManager, createdEvents);
      return {
        userClaimIds,
        claimsById,
      };
    });

    if (!result.success) {
      notifications.error({ message: messages.FAILED_TO_LOAD_CLAIMS, errorOrMessage: result.error });
      setStatus('failed');
      return;
    }

    setChainData(
      'Loaded claims',
      updateImmutablyCurried((state) => {
        state.claims.userClaimIds = result.data.userClaimIds;
        state.claims.byId = { ...state.claims.byId, ...result.data.claimsById };
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
    const result = await go(async () => {
      // @ts-ignore
      const filter = claimsManager.filters.CreatedClaim(BigNumber.from(claimId), userAccount);
      // @ts-ignore
      const createdEvents = await claimsManager.queryFilter(filter);
      return await loadClaimsByCreatedEvents(claimsManager, createdEvents);
    });

    if (!result.success) {
      notifications.error({ message: messages.FAILED_TO_LOAD_CLAIMS, errorOrMessage: result.error });
      setStatus('failed');
      return;
    }

    setChainData(
      'Loaded claim',
      updateImmutablyCurried((state) => {
        state.claims.byId = { ...state.claims.byId, ...result.data };
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

async function loadClaimsByCreatedEvents(contract: any, createdEvents: any[]) {
  // TODO DAO-151 Remove the sleep
  await sleep();
  const claims = await Promise.all(createdEvents.map((event) => contract.claims(event.args.claimIndex)));

  return claims.reduce((acc, claimData) => {
    const event = createdEvents.find((ev) => ev.args.claimIndex.toString() === claimData.claimIndex.toString());

    const claim: Claim = {
      claimId: event.args.claimIndex.toString(),
      policyId: event.args.policyHash.toString(),
      evidence: event.args.evidence,
      timestamp: blockTimestampToDate(event.args.claimCreationTime),
      claimant: event.args.claimant,
      beneficiary: event.args.beneficiary,
      claimedAmount: event.args.claimAmount,
      counterOfferAmount: null, // TODO
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
