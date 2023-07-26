import { useCallback } from 'react';
import { useChainData } from '../../chain-data';
import { useApi3Pool, usePossibleChainDataUpdate, useTimelockManager } from '../../contracts';
import { notifications } from '../../components/notifications';
import { messages } from '../../utils';
import { go } from '@api3/promise-utils';

export const useLoadVestingData = () => {
  const api3Pool = useApi3Pool();
  const timelockManager = useTimelockManager();
  const { provider, setChainData, userAccount } = useChainData();

  const loadDashboardData = useCallback(async () => {
    if (!provider || !api3Pool || !timelockManager || !userAccount) return null;

    const goVestingData = await go(() => api3Pool.getUser(userAccount));
    if (!goVestingData.success) {
      return notifications.error({
        message: messages.FAILED_TO_LOAD_VESTING_DATA,
        errorOrMessage: goVestingData.error,
      });
    }
    const vestingData = goVestingData.data;

    const goTimelock = await go(() => timelockManager.getTimelock(userAccount));
    if (!goTimelock.success) {
      return notifications.error({
        message: messages.FAILED_TO_LOAD_VESTING_DATA,
        errorOrMessage: goTimelock.error,
      });
    }
    const timelock = goTimelock.data;

    setChainData('Load vesting data', {
      vesting: {
        amountVested: vestingData.vesting,
        remainingToWithdraw: timelock.remainingAmount,
      },
    });
  }, [provider, api3Pool, timelockManager, userAccount, setChainData]);

  usePossibleChainDataUpdate(loadDashboardData);
};
