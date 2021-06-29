import { useCallback } from 'react';
import { useChainData } from '../../chain-data';
import { useApi3Pool, usePossibleChainDataUpdate, useTimelockManager } from '../../contracts';
import { notifications } from '../../components/notifications/notifications';
import { go, messages } from '../../utils';

export const useLoadVestingData = () => {
  const api3Pool = useApi3Pool();
  const timelockManager = useTimelockManager();
  const { provider, setChainData, userAccount } = useChainData();

  const loadDashboardData = useCallback(async () => {
    if (!provider || !api3Pool || !timelockManager || !userAccount) return null;

    const [vestingDataErr, vestingData] = await go(api3Pool.getUser(userAccount));
    if (vestingDataErr || !vestingData) {
      notifications.error({ message: messages.FAILED_TO_LOAD_VESTING_DATA, errorOrMessage: vestingDataErr! });
      return;
    }

    const [timelockErr, timelock] = await go(timelockManager.getTimelock(userAccount));
    if (timelockErr || !timelock) {
      notifications.error({ message: messages.FAILED_TO_LOAD_VESTING_DATA, errorOrMessage: timelockErr! });
      return;
    }

    setChainData('Load vesting data', {
      vesting: {
        amountVested: vestingData.vesting,
        remainingToWithdraw: timelock.remainingAmount,
      },
    });
  }, [provider, api3Pool, timelockManager, userAccount, setChainData]);

  usePossibleChainDataUpdate(loadDashboardData);
};
