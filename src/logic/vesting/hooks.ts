import { useCallback } from 'react';
import { useChainData } from '../../chain-data';
import { useApi3Pool, usePossibleChainDataUpdate, useTimelockManager } from '../../contracts';
import { notifications } from '../../components/notifications/notifications';
import { go, GO_ERROR_INDEX, GO_RESULT_INDEX, isGoSuccess, messages } from '../../utils';

export const useLoadVestingData = () => {
  const api3Pool = useApi3Pool();
  const timelockManager = useTimelockManager();
  const { provider, setChainData, userAccount } = useChainData();

  const loadDashboardData = useCallback(async () => {
    if (!provider || !api3Pool || !timelockManager || !userAccount) return null;

    const goVestingData = await go(api3Pool.getUser(userAccount));
    if (!isGoSuccess(goVestingData)) {
      return notifications.error({
        message: messages.FAILED_TO_LOAD_VESTING_DATA,
        errorOrMessage: goVestingData[GO_ERROR_INDEX],
      });
    }
    const vestingData = goVestingData[GO_RESULT_INDEX];

    const goTimelock = await go(timelockManager.getTimelock(userAccount));
    if (!isGoSuccess(goTimelock)) {
      return notifications.error({
        message: messages.FAILED_TO_LOAD_VESTING_DATA,
        errorOrMessage: goTimelock[GO_ERROR_INDEX],
      });
    }
    const timelock = goTimelock[GO_RESULT_INDEX];

    setChainData('Load vesting data', {
      vesting: {
        amountVested: vestingData.vesting,
        remainingToWithdraw: timelock.remainingAmount,
      },
    });
  }, [provider, api3Pool, timelockManager, userAccount, setChainData]);

  usePossibleChainDataUpdate(loadDashboardData);
};
