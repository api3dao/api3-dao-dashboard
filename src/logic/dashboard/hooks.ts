import { useCallback } from 'react';
import { useChainData } from '../../chain-data';
import { useApi3Pool, useApi3Token, useConvenience, usePossibleChainDataUpdate } from '../../contracts';
import { notifications } from '../../components/notifications/notifications';
import { go, GO_ERROR_INDEX, GO_RESULT_INDEX, isGoSuccess, messages } from '../../utils';

export const useLoadDashboardData = () => {
  const api3Pool = useApi3Pool();
  const api3Token = useApi3Token();
  const convenience = useConvenience();
  const { provider, setChainData, userAccount } = useChainData();

  const loadDashboardData = useCallback(async () => {
    if (!provider || !api3Pool || !api3Token || !convenience || !userAccount) return null;

    const goStakingData = await go(convenience.getUserStakingData(userAccount));
    if (!isGoSuccess(goStakingData)) {
      return notifications.error({
        message: messages.FAILED_TO_LOAD_CHAIN_DATA,
        errorOrMessage: goStakingData[GO_ERROR_INDEX],
      });
    }
    const stakingData = goStakingData[GO_RESULT_INDEX];

    const goAllowance = await go(api3Token.allowance(userAccount, api3Pool.address));
    if (!isGoSuccess(goAllowance)) {
      return notifications.error({
        message: messages.FAILED_TO_LOAD_CHAIN_DATA,
        errorOrMessage: goAllowance[GO_ERROR_INDEX],
      });
    }
    const allowance = goAllowance[GO_RESULT_INDEX];

    setChainData('Load dashboard data', {
      dashboardState: {
        allowance,
        // NOTE: normally we could just spread the stakingData object here, but ethers.js
        // also returns the values in an array.
        userApi3Balance: stakingData.userApi3Balance,
        api3Supply: stakingData.api3Supply,
        apr: stakingData.apr,
        stakeTarget: stakingData.stakeTarget,
        totalShares: stakingData.totalShares,
        totalStake: stakingData.totalStake,
        userLocked: stakingData.userLocked,
        userStaked: stakingData.userStaked,
        userUnstaked: stakingData.userUnstaked,
        userUnstakeAmount: stakingData.userUnstakeAmount,
        userUnstakeScheduledFor: stakingData.userUnstakeScheduledFor,
        userUnstakeShares: stakingData.userUnstakeShares,
        userVesting: stakingData.userVesting,
      },
    });
  }, [provider, api3Pool, api3Token, convenience, userAccount, setChainData]);

  usePossibleChainDataUpdate(loadDashboardData);
};
