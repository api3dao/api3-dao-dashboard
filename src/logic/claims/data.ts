import { useCallback, useMemo, useState } from 'react';
import { BigNumber } from 'ethers';
import { go } from '@api3/promise-utils';
import { addDays } from 'date-fns';
import { blockTimestampToDate, messages } from '../../utils';
import { Claim, ClaimStatus, ClaimStatuses, updateImmutablyCurried, useChainData } from '../../chain-data';
import { notifications } from '../../components/notifications';
import { usePossibleChainDataUpdate } from '../../contracts';

export function useUserClaims() {
  const { provider, setChainData, claims } = useChainData();
  const sortedClaims = useMemo(() => {
    if (!claims.userClaimIds) return null;
    // Sort by claim id in descending order
    return claims.userClaimIds
      .map((claimId) => claims.byId![claimId]!)
      .sort((a, b) => parseInt(b.claimId) - parseInt(a.claimId));
  }, [claims]);

  const [status, setStatus] = useState<'idle' | 'loading' | 'resolved' | 'failed'>('idle');
  const loadUserClaims = useCallback(async () => {
    if (!provider) return;

    setStatus('loading');
    const result = await go(async () => {
      const userClaimIds = mockUserClaimIds.map((id) => id.toString());
      const claimsById = await loadClaimsByIds(userClaimIds);
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
    setStatus('resolved');
  }, [provider, setChainData]);

  usePossibleChainDataUpdate(loadUserClaims);

  return {
    data: sortedClaims,
    loading: status === 'loading',
  };
}

export function useUserClaimById(claimId: string) {
  const { provider, setChainData, claims } = useChainData();
  const data = claims.byId?.[claimId] || null;

  const [status, setStatus] = useState<'idle' | 'loading' | 'resolved' | 'failed'>('idle');
  const loadUserClaim = useCallback(async () => {
    if (!provider) return;

    setStatus('loading');
    const result = await go(async () => {
      const userClaimIds = mockUserClaimIds.map((id) => id.toString());
      if (!userClaimIds.includes(claimId)) {
        return null;
      }
      return await loadClaimsByIds([claimId]);
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
    setStatus('resolved');
  }, [claimId, provider, setChainData]);

  usePossibleChainDataUpdate(loadUserClaim);

  return {
    data,
    loading: status === 'loading',
    loaded: status === 'resolved',
  };
}

async function loadClaimsByIds(claimIds: string[]) {
  await sleep();
  return mockContractData
    .filter((claimData) => claimIds.includes(claimData.claimId.toString()))
    .reduce((acc, claimData) => {
      const claim: Claim = {
        claimId: claimData.claimId.toString(),
        policyId: claimData.policyId.toString(),
        evidence: claimData.evidence,
        timestamp: blockTimestampToDate(claimData.timestamp),
        claimant: claimData.claimant,
        beneficiary: claimData.beneficiary,
        claimedAmount: claimData.claimedAmount,
        counterOfferAmount: claimData.counterOfferAmount ?? null,
        resolvedAmount: claimData.resolvedAmount ?? null,
        open: claimData.open,
        status: ClaimStatuses[claimData.status as ClaimStatus],
        statusUpdatedAt: blockTimestampToDate(claimData.statusUpdatedAt),
        statusUpdatedBy: getStatusUpdatedByType(claimData.statusUpdatedBy),
        deadline: null,
        transactionHash: claimData.transactionHash,
      };

      claim.deadline = calculateDeadline(claim);
      acc[claim.claimId] = claim;
      return acc;
    }, {} as Record<string, Claim>);
}

function getStatusUpdatedByType(updatedBy: number): Claim['statusUpdatedBy'] {
  switch (updatedBy) {
    case 1:
      return 'mediator';
    case 2:
      return 'arbitrator';
    default:
      return 'claimant';
  }
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

// TODO DAO-151 Remove mock data
const mockContractData = [
  {
    claimId: BigNumber.from(22),
    policyId: BigNumber.from(111),
    evidence: '0B488144f946F1c6C1eFaB0F',
    timestamp: BigNumber.from(1652191585),
    claimant: '0x15asde3EF0B4881432948kajds0aB0FED112334s',
    beneficiary: '0x15asde3EF0B4881432948kajds0aB0FED112334s',
    claimedAmount: BigNumber.from('200000000000000000000'),
    counterOfferAmount: null,
    resolvedAmount: BigNumber.from(0),
    open: false,
    status: 6,
    statusUpdatedAt: BigNumber.from(1652191585),
    statusUpdatedBy: 2,
    transactionHash: null,
  },
  {
    claimId: BigNumber.from(43),
    policyId: BigNumber.from(121),
    evidence: '0B488144f946F1c6C1eFaB0F',
    timestamp: BigNumber.from(1652191585),
    claimant: '0x15asde3EF0B4881432948kajds0aB0FED112334s',
    beneficiary: '0x15asde3EF0B4881432948kajds0aB0FED112334s',
    claimedAmount: BigNumber.from('200000000000000000000'),
    counterOfferAmount: BigNumber.from('150000000000000000000'),
    resolvedAmount: null,
    open: true,
    status: 4,
    statusUpdatedAt: BigNumber.from(1652191585),
    statusUpdatedBy: 0,
    transactionHash: null,
  },
  {
    claimId: BigNumber.from(54),
    policyId: BigNumber.from(131),
    evidence: '0B488144f946F1c6C1eFaB0F',
    timestamp: BigNumber.from(1652191585),
    claimant: '0x15asde3EF0B4881432948kajds0aB0FED112334s',
    beneficiary: '0x15asde3EF0B4881432948kajds0aB0FED112334s',
    claimedAmount: BigNumber.from('200000000000000000000'),
    counterOfferAmount: null,
    resolvedAmount: null,
    open: true,
    status: 1,
    statusUpdatedAt: BigNumber.from(1652191585),
    statusUpdatedBy: 0,
    transactionHash: null,
  },
  {
    claimId: BigNumber.from(75),
    policyId: BigNumber.from(131),
    evidence: '0B488144f946F1c6C1eFaB0F',
    timestamp: BigNumber.from(1652191585),
    claimant: '0x15asde3EF0B4881432948kajds0aB0FED112334s',
    beneficiary: '0x15asde3EF0B4881432948kajds0aB0FED112334s',
    claimedAmount: BigNumber.from('200000000000000000000'),
    counterOfferAmount: null,
    resolvedAmount: BigNumber.from('200000000000000000000'),
    open: true,
    status: 3,
    statusUpdatedAt: BigNumber.from(1652191585),
    statusUpdatedBy: 2,
    transactionHash: null,
  },
  {
    claimId: BigNumber.from(86),
    policyId: BigNumber.from(131),
    evidence: '0B488144f946F1c6C1eFaB0F',
    timestamp: BigNumber.from(1652191585),
    claimant: '0x15asde3EF0B4881432948kajds0aB0FED112334s',
    beneficiary: '0x15asde3EF0B4881432948kajds0aB0FED112334s',
    claimedAmount: BigNumber.from('200000000000000000000'),
    counterOfferAmount: BigNumber.from('150000000000000000000'),
    resolvedAmount: null,
    open: false,
    status: 5,
    statusUpdatedAt: BigNumber.from(1652191585),
    statusUpdatedBy: 2,
    transactionHash: null,
  },
  {
    claimId: BigNumber.from(91),
    policyId: BigNumber.from(101),
    evidence: '0B488144f946F1c6C1eFaB0F',
    timestamp: BigNumber.from(Math.round(addDays(new Date(), -4).getTime() / 1000)),
    claimant: '0x15asde3EF0B4881432948kajds0aB0FED112334s',
    beneficiary: '0x15asde3EF0B4881432948kajds0aB0FED112334s',
    claimedAmount: BigNumber.from('100000000000000000000'),
    counterOfferAmount: BigNumber.from('70000000000000000000'),
    resolvedAmount: null,
    open: true,
    status: 2,
    statusUpdatedAt: BigNumber.from(Math.round(addDays(new Date(), -1).getTime() / 1000)),
    statusUpdatedBy: 1,
    transactionHash: null,
  },
];

const mockUserClaimIds = mockContractData.map((c) => c.claimId);
const sleep = () => new Promise((res) => setTimeout(res, 2000));
