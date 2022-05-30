import { Policy, updateImmutablyCurried, useChainData } from '../../chain-data';
import { useClaimsManager, usePossibleChainDataUpdate } from '../../contracts';
import { useCallback, useState } from 'react';
import { go } from '@api3/promise-utils';
import { notifications } from '../../components/notifications';
import { blockTimestampToDate } from '../../utils';

export function useUserPolicyById(policyId: string) {
  const { userAccount, policies, setChainData } = useChainData();
  const claimsManager = useClaimsManager();
  const data = policies.byId?.[policyId] || null;

  const [status, setStatus] = useState<'idle' | 'loading' | 'loaded' | 'failed'>('idle');
  const loadPolicy = useCallback(async () => {
    if (!claimsManager) return;

    setStatus('loading');
    const result = await go(async () => {
      // @ts-ignore
      const filter = claimsManager.filters.CreatedPolicy(null, userAccount, policyId);
      // @ts-ignore
      const createdEvents = await claimsManager.queryFilter(filter);
      const policiesById = createdEvents.reduce((acc, event) => {
        const eventArgs = event.args!;
        const policy: Policy = {
          policyId: eventArgs.policyHash,
          claimant: eventArgs.claimant,
          beneficiary: eventArgs.beneficiary,
          coverageAmount: eventArgs.coverageAmount,
          startTime: blockTimestampToDate(eventArgs.startTime),
          endTime: blockTimestampToDate(eventArgs.endTime),
          ipfsHash: eventArgs.policy,
        };

        acc[policy.policyId] = policy;
        return acc;
      }, {} as { [policyId: string]: Policy });

      return {
        policyIds: createdEvents.map((event) => event.args!.policyHash),
        policiesById,
      };
    });

    if (!result.success) {
      notifications.error({ message: 'Failed to load policies', errorOrMessage: result.error });
      setStatus('failed');
      return;
    }

    setChainData(
      'Loaded policy',
      updateImmutablyCurried((state) => {
        state.policies.byId = { ...state.policies.byId, ...result.data.policiesById };
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
