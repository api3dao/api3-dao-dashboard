import { useEffect, useMemo, useState } from 'react';
import last from 'lodash/last';
import { BigNumber } from 'ethers';
import { isWithinInterval } from 'date-fns';
import { go } from '@api3/promise-utils';
import { blockTimestampToDate, messages, sortEvents } from '../../utils';
import { BasePolicy, Policy, produceState, useChainData } from '../../chain-data';
import { useClaimsManager, useChainUpdateEffect } from '../../contracts';
import { ClaimsManager } from '../../contracts/artifacts';
import { notifications } from '../../components/notifications';

/**
 * Loads all policies that are linked to the user's account. The remaining coverage amount for each policy does not
 * get loaded with this hook. We omit its loading so that we are able to only load the remaining coverage for the
 * current page of policies the user is viewing (the user can have a large number of policies).
 */
export function useUserPolicies() {
  const { userAccount, policies, setChainData } = useChainData();
  const claimsManager = useClaimsManager();

  const sortedPolicies: BasePolicy[] | null = useMemo(() => {
    if (!policies.userPolicyIds) return null;
    return (
      policies.userPolicyIds
        .map((policyId) => {
          const policy = policies.byId![policyId]!;
          return {
            ...policy,
            remainingCoverageInUsd: policies.remainingCoverageById?.[policyId],
          };
        })
        // Sort by the claimsAllowedUntil date in descending order
        .sort((a, b) => b.claimsAllowedUntil.getTime() - a.claimsAllowedUntil.getTime())
    );
  }, [policies.userPolicyIds, policies.byId, policies.remainingCoverageById]);

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
        produceState((state) => {
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

/**
 * Loads the policy (that is linked to the user's account) by its id. The policy will not be found if it is not linked
 * to the user's account. The remaining coverage also gets loaded and the returned policy will always have the
 * remaining coverage present.
 */
export function useUserPolicyById(policyId: string) {
  const { userAccount, policies, setChainData } = useChainData();
  const claimsManager = useClaimsManager();

  const data: Policy | null = useMemo(() => {
    const policy = policies.byId?.[policyId];
    const remainingCoverageInUsd = policies.remainingCoverageById?.[policyId];
    if (!policy || !remainingCoverageInUsd) {
      return null;
    }
    return { ...policy, remainingCoverageInUsd };
  }, [policyId, policies.byId, policies.remainingCoverageById]);

  const [status, setStatus] = useState<'idle' | 'loading' | 'loaded' | 'failed'>('idle');
  useChainUpdateEffect(() => {
    if (!claimsManager) return;

    const load = async () => {
      setStatus('loading');
      const result = await go(() =>
        Promise.all([
          loadPolicies(claimsManager, { userAccount, policyId }),
          loadRemainingCoverage(claimsManager, [policyId]),
        ])
      );

      if (!result.success) {
        notifications.error({ message: messages.FAILED_TO_LOAD_POLICIES, errorOrMessage: result.error });
        setStatus('failed');
        return;
      }

      setChainData(
        'Loaded policy',
        produceState((state) => {
          state.policies.byId = { ...state.policies.byId, ...result.data[0].byId };
          state.policies.remainingCoverageById = { ...state.policies.remainingCoverageById, ...result.data[1].byId };
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

async function loadPolicies(contract: ClaimsManager, params: { userAccount?: string; policyId?: string }) {
  const { userAccount = null, policyId = null } = params;
  const [createdEvents, upgradedEvents, downgradedEvents, metadataEvents] = await Promise.all([
    contract.queryFilter(contract.filters.CreatedPolicy(userAccount, policyId)),
    contract.queryFilter(contract.filters.UpgradedPolicy(userAccount, policyId)),
    contract.queryFilter(contract.filters.DowngradedPolicy(userAccount, policyId)),
    contract.queryFilter(contract.filters.AnnouncedPolicyMetadata(userAccount, policyId)),
  ]);

  if (!createdEvents.length) {
    return { ids: [], byId: {} };
  }

  const stateChangedEvents = sortEvents([...upgradedEvents, ...downgradedEvents] as const);

  const policiesById = createdEvents.reduce((acc, event) => {
    const eventArgs = event.args;
    // The policy can be upgraded or downgraded multiple times, and we only care about the last event
    const stateChangedEvent = last(stateChangedEvents.filter((ev) => ev.args.policyHash === eventArgs.policyHash));
    // The policy metadata can be updated multiple times, and we only care about the last event
    const metadataEvent = last(metadataEvents.filter((ev) => ev.args.policyHash === eventArgs.policyHash));

    const policy = {
      policyId: eventArgs.policyHash,
      claimant: eventArgs.claimant,
      claimsAllowedFrom: blockTimestampToDate(eventArgs.claimsAllowedFrom),
      claimsAllowedUntil: blockTimestampToDate(
        stateChangedEvent ? stateChangedEvent.args.claimsAllowedUntil : eventArgs.claimsAllowedUntil
      ),
      ipfsHash: eventArgs.policy,
      metadata: metadataEvent ? metadataEvent.args.metadata : 'Unknown', // We should always have a metadata event
    };

    acc[policy.policyId] = policy;
    return acc;
  }, {} as { [policyId: string]: Omit<Policy, 'remainingCoverageInUsd'> });

  return {
    ids: createdEvents.map((event) => event.args.policyHash),
    byId: policiesById,
  };
}

export function isActive(policy: BasePolicy) {
  return isWithinInterval(new Date(), { start: policy.claimsAllowedFrom, end: policy.claimsAllowedUntil });
}

export const canCreateClaim = isActive;

export function useRemainingCoverageLoader(policyIds: string[]) {
  const claimsManager = useClaimsManager();
  const { setChainData } = useChainData();

  useEffect(() => {
    if (!claimsManager || !policyIds.length) return;

    const load = async () => {
      const result = await go(() => loadRemainingCoverage(claimsManager, policyIds));

      if (!result.success) {
        notifications.error({ message: messages.FAILED_TO_LOAD_REMAINING_COVERAGE, errorOrMessage: result.error });
        return;
      }

      setChainData(
        'Loaded remaining policy coverage',
        produceState((state) => {
          state.policies.remainingCoverageById = {
            ...state.policies.remainingCoverageById,
            ...result.data.byId,
          };
        })
      );
    };

    load();
  }, [claimsManager, policyIds, setChainData]);
}

async function loadRemainingCoverage(contract: ClaimsManager, policyIds: string[]) {
  const calls = policyIds.map((id) => {
    return contract.interface.encodeFunctionData('policyHashToState', [id]);
  });

  const encodedResults = await contract.callStatic.multicall(calls);
  const decodedResults = encodedResults.map((res) => {
    return contract.interface.decodeFunctionResult('policyHashToState', res);
  });

  const amountsById = policyIds.reduce((acc, policyId, index) => {
    acc[policyId] = decodedResults[index]!.coverageAmountInUsd;
    return acc;
  }, {} as { [policyId: string]: BigNumber });

  return { byId: amountsById };
}
