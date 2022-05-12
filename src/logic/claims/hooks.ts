import { updateImmutablyCurried, useChainData } from '../../chain-data';
import { BigNumber } from 'ethers';
import { useCallback, useMemo, useState } from 'react';
import { blockTimestampToDate, messages } from '../../utils';
import { Claim, ClaimStatus, ClaimStatuses } from '../../chain-data';
import { go } from '@api3/promise-utils';
import { notifications } from '../../components/notifications';
import { usePossibleChainDataUpdate } from '../../contracts';
import { addDays } from 'date-fns';

export function useClaims() {
  const { provider, setChainData, claims } = useChainData();
  const sortedClaims = useMemo(() => {
    if (!claims) return null;
    // Sort by claim id in descending order
    return Object.values(claims).sort((a, b) => parseInt(b.claimId) - parseInt(a.claimId));
  }, [claims]);

  const loadClaims = async () => {
    await sleep();
    return mockContractData.reduce((acc, claim) => {
      const status = ClaimStatuses[claim.status as ClaimStatus];
      const statusUpdatedAt = blockTimestampToDate(claim.statusUpdatedAt);
      const claimedAmount = claim.claimedAmount.toNumber();
      const resolvedAmount = claim.resolvedAmount?.toNumber() ?? null;

      let deadline = null;
      if (status === 'Resolved') {
        if (resolvedAmount !== claimedAmount) {
          // Kleros came back with an amount less than the original claim, so the user has 3 days to appeal
          deadline = addDays(statusUpdatedAt, 3);
        }
      } else if (status === 'MediationOffered' || status === 'Rejected') {
        deadline = addDays(statusUpdatedAt, 3);
      }

      acc[claim.claimId.toString()] = {
        claimId: claim.claimId.toString(),
        timestamp: blockTimestampToDate(claim.timestamp),
        claimant: claim.claimant,
        beneficiary: claim.beneficiary,
        claimedAmount,
        counterOfferAmount: claim.counterOfferAmount?.toNumber() ?? null,
        resolvedAmount,
        policyId: claim.policyId.toString(),
        evidence: claim.evidence,
        status,
        statusUpdatedAt,
        deadline,
      };
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

const mockContractData = [
  {
    claimId: BigNumber.from(1),
    policyId: BigNumber.from(101),
    evidence: '0B488144f946F1c6C1eFaB0F',
    timestamp: BigNumber.from(1652191585),
    claimant: process.env.REACT_APP_LOCAL_WALLET_ADDRESS || '0x-some-account-01',
    beneficiary: process.env.REACT_APP_LOCAL_WALLET_ADDRESS || '0x-some-account-01',
    claimedAmount: BigNumber.from(100),
    counterOfferAmount: BigNumber.from(70),
    resolvedAmount: null,
    status: 2,
    statusUpdatedAt: BigNumber.from(1652251585),
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
    resolvedAmount: null,
    status: 1,
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
    status: 3,
    statusUpdatedAt: BigNumber.from(1652191585),
  },
];

const sleep = () => new Promise((res) => setTimeout(res, 2000));
