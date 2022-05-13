import { useCallback, useMemo, useState } from 'react';
import { BigNumber } from 'ethers';
import { go } from '@api3/promise-utils';
import { addDays } from 'date-fns';
import { blockTimestampToDate, messages } from '../../utils';
import { Claim, ClaimStatus, ClaimStatuses, updateImmutablyCurried, useChainData } from '../../chain-data';
import { notifications } from '../../components/notifications';
import { usePossibleChainDataUpdate } from '../../contracts';

export function useActiveClaims() {
  const { provider, setChainData, claims } = useChainData();
  const sortedClaims = useMemo(() => {
    if (!claims) return null;
    // Sort by claim id in descending order
    return Object.values(claims).sort((a, b) => parseInt(b.claimId) - parseInt(a.claimId));
  }, [claims]);

  const loadClaims = async () => {
    await sleep();
    const openClaimIds = mockOpenClaimIds.map((id) => id.toString());
    return mockContractData.reduce((acc, claimData) => {
      const claim: Claim = {
        claimId: claimData.claimId.toString(),
        policyId: claimData.policyId.toString(),
        evidence: claimData.evidence,
        timestamp: blockTimestampToDate(claimData.timestamp),
        claimant: claimData.claimant,
        beneficiary: claimData.beneficiary,
        claimedAmount: claimData.claimedAmount.toNumber(),
        counterOfferAmount: claimData.counterOfferAmount?.toNumber() ?? null,
        resolvedAmount: claimData.resolvedAmount?.toNumber() ?? null,
        open: openClaimIds.includes(claimData.claimId.toString()),
        status: ClaimStatuses[claimData.status as ClaimStatus],
        statusUpdatedAt: blockTimestampToDate(claimData.statusUpdatedAt),
        deadline: null,
      };

      if (claim.open) {
        claim.deadline = calculateDeadline(claim);
      }

      acc[claim.claimId] = claim;
      return acc;
    }, {} as Record<string, Claim>);
  };

  const [status, setStatus] = useState<'idle' | 'loading' | 'resolved' | 'failed'>('idle');
  const handleLoadClaims = useCallback(async () => {
    if (!provider) return;
    setStatus('loading');
    const result = await go(loadClaims());
    if (!result.success) {
      notifications.error({ message: messages.FAILED_TO_LOAD_CLAIMS, errorOrMessage: result.error });
      setStatus('failed');
      return;
    }
    setChainData(
      'Loaded claims',
      updateImmutablyCurried((state) => {
        state.claims = { ...state.claims, ...result.data };
      })
    );
    setStatus('resolved');
  }, [provider, setChainData]);

  usePossibleChainDataUpdate(handleLoadClaims);

  return {
    data: sortedClaims,
    loading: status === 'loading',
  };
}

function calculateDeadline(claim: Claim) {
  switch (claim.status) {
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

const mockContractData = [
  {
    claimId: BigNumber.from(1),
    policyId: BigNumber.from(101),
    evidence: '0B488144f946F1c6C1eFaB0F',
    timestamp: BigNumber.from(Math.round(addDays(new Date(), -4).getTime() / 1000)),
    claimant: process.env.REACT_APP_LOCAL_WALLET_ADDRESS || '0x-some-account-01',
    beneficiary: process.env.REACT_APP_LOCAL_WALLET_ADDRESS || '0x-some-account-01',
    claimedAmount: BigNumber.from(100),
    counterOfferAmount: BigNumber.from(70),
    resolvedAmount: null,
    status: 2,
    statusUpdatedAt: BigNumber.from(Math.round(addDays(new Date(), -1).getTime() / 1000)),
  },
  {
    claimId: BigNumber.from(2),
    policyId: BigNumber.from(111),
    evidence: '0B488144f946F1c6C1eFaB0F',
    timestamp: BigNumber.from(1652191585),
    claimant: '0x-some-account-02',
    beneficiary: '0x-some-account-02',
    claimedAmount: BigNumber.from(200),
    counterOfferAmount: null,
    resolvedAmount: BigNumber.from(200),
    status: 6,
    statusUpdatedAt: BigNumber.from(1652191585),
  },
  {
    claimId: BigNumber.from(3),
    policyId: BigNumber.from(121),
    evidence: '0B488144f946F1c6C1eFaB0F',
    timestamp: BigNumber.from(1652191585),
    claimant: '0x-some-account-03',
    beneficiary: '0x-some-account-03',
    claimedAmount: BigNumber.from(200),
    counterOfferAmount: null,
    resolvedAmount: BigNumber.from(150),
    status: 4,
    statusUpdatedAt: BigNumber.from(1652191585),
  },
];

const mockOpenClaimIds = [BigNumber.from(1), BigNumber.from(2)];
const sleep = () => new Promise((res) => setTimeout(res, 2000));
