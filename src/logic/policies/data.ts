import { useCallback, useMemo, useState } from 'react';
import { addDays, isBefore } from 'date-fns';
import { go } from '@api3/promise-utils';
import { blockTimestampToDate, messages } from '../../utils';
import { Policy, updateImmutablyCurried, useChainData } from '../../chain-data';
import { ClaimsManagerWithKlerosArbitration, useClaimsManager, usePossibleChainDataUpdate } from '../../contracts';
import { notifications } from '../../components/notifications';

export function useUserPolicies() {
  const { userAccount, policies, setChainData } = useChainData();
  const claimsManager = useClaimsManager();
  const sortedPolicies = useMemo(() => {
    if (!policies.userPolicyIds) return null;
    // Sort by policy end time in descending order
    return policies.userPolicyIds
      .map((policyId) => policies.byId![policyId]!)
      .sort((a, b) => b.endTime.getTime() - a.endTime.getTime());
  }, [policies]);

  const [status, setStatus] = useState<'idle' | 'loading' | 'loaded' | 'failed'>('idle');
  const loadUserPolicies = useCallback(async () => {
    if (!claimsManager) return;

    setStatus('loading');
    const result = await go(() => loadPolicies(claimsManager, { userAccount }));

    if (!result.success) {
      notifications.error({ message: messages.FAILED_TO_LOAD_POLICIES, errorOrMessage: result.error });
      setStatus('failed');
      return;
    }

    setChainData(
      'Loaded policies',
      updateImmutablyCurried((state) => {
        state.policies.userPolicyIds = result.data.ids;
        state.policies.byId = { ...state.policies.byId, ...result.data.byId };
      })
    );
    setStatus('loaded');
  }, [claimsManager, userAccount, setChainData]);

  usePossibleChainDataUpdate(loadUserPolicies);

  return {
    data: sortedPolicies,
    status,
  };
}

export function useUserPolicyById(policyId: string) {
  const { userAccount, policies, setChainData } = useChainData();
  const claimsManager = useClaimsManager();
  const data = policies.byId?.[policyId] || null;

  const [status, setStatus] = useState<'idle' | 'loading' | 'loaded' | 'failed'>('idle');
  const loadPolicy = useCallback(async () => {
    if (!claimsManager) return;

    setStatus('loading');
    const result = await go(() => loadPolicies(claimsManager, { userAccount, policyId }));

    if (!result.success) {
      notifications.error({ message: messages.FAILED_TO_LOAD_POLICIES, errorOrMessage: result.error });
      setStatus('failed');
      return;
    }

    setChainData(
      'Loaded policy',
      updateImmutablyCurried((state) => {
        state.policies.byId = { ...state.policies.byId, ...result.data.byId };
      })
    );
    setStatus('loaded');
  }, [claimsManager, userAccount, policyId, setChainData]);

  usePossibleChainDataUpdate(loadPolicy);

  return {
    data,
    status,
  };
}

async function loadPolicies(
  contract: ClaimsManagerWithKlerosArbitration,
  params: { userAccount?: string; policyId?: string }
): Promise<{ ids: string[]; byId: Record<string, Policy> }> {
  const { userAccount = null, policyId = null } = params;
  const createdEvents = await contract.queryFilter(contract.filters.CreatedPolicy(null, userAccount, policyId));

  if (!createdEvents.length) {
    return { ids: [], byId: {} };
  }

  const policiesById = createdEvents.reduce((acc, event) => {
    const eventArgs = event.args;
    const policy: Policy = {
      policyId: eventArgs.policyHash,
      claimant: eventArgs.claimant,
      beneficiary: eventArgs.beneficiary,
      coverageAmount: eventArgs.coverageAmount,
      startTime: blockTimestampToDate(eventArgs.claimsAllowedFrom),
      endTime: blockTimestampToDate(eventArgs.claimsAllowedUntil),
      ipfsHash: eventArgs.policy,
      metadata: eventArgs.metadata,
    };

    acc[policy.policyId] = policy;
    return acc;
  }, {} as { [policyId: string]: Policy });

  return {
    ids: createdEvents.map((event) => event.args.policyHash),
    byId: policiesById,
  };
}

export function isActive(policy: Policy) {
  return isBefore(new Date(), policy.endTime);
}

export function canCreateClaim(policy: Policy) {
  return isBefore(new Date(), addDays(policy.endTime, 3));
}
