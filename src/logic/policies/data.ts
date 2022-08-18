import { useMemo, useState } from 'react';
import { isWithinInterval } from 'date-fns';
import { go } from '@api3/promise-utils';
import { blockTimestampToDate, messages } from '../../utils';
import { Policy, updateImmutablyCurried, useChainData } from '../../chain-data';
import { ClaimsManager, useClaimsManager, useChainUpdateEffect } from '../../contracts';
import { notifications } from '../../components/notifications';

export function useUserPolicies() {
  const { userAccount, policies, setChainData } = useChainData();
  const claimsManager = useClaimsManager();
  const sortedPolicies = useMemo(() => {
    if (!policies.userPolicyIds) return null;
    // Sort by policy end time in descending order
    return policies.userPolicyIds
      .map((policyId) => policies.byId![policyId]!)
      .sort((a, b) => b.claimsAllowedUntil.getTime() - a.claimsAllowedUntil.getTime());
  }, [policies]);

  const [status, setStatus] = useState<'idle' | 'loading' | 'loaded' | 'failed'>('idle');
  useChainUpdateEffect(() => {
    if (!claimsManager) return;

    const load = async () => {
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
    };

    load();
  }, [claimsManager, userAccount, setChainData]);

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
  useChainUpdateEffect(() => {
    if (!claimsManager) return;

    const load = async () => {
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
    };

    load();
  }, [claimsManager, userAccount, policyId, setChainData]);

  return {
    data,
    status,
  };
}

async function loadPolicies(
  contract: ClaimsManager,
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
      coverageAmountInUsd: eventArgs.coverageAmountInUsd,
      claimsAllowedFrom: blockTimestampToDate(eventArgs.claimsAllowedFrom),
      claimsAllowedUntil: blockTimestampToDate(eventArgs.claimsAllowedUntil),
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
  return isWithinInterval(new Date(), { start: policy.claimsAllowedFrom, end: policy.claimsAllowedUntil });
}

export const canCreateClaim = isActive;
