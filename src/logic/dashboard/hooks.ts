import { useCallback } from 'react';
import { useChainData } from '../../chain-data';
import { useApi3Pool, useApi3Token, useConvenience, usePossibleChainDataUpdate } from '../../contracts';
import { notifications } from '../../components/notifications/notifications';
import { go, messages } from '../../utils';

export const useLoadDashboardData = () => {
  const api3Pool = useApi3Pool();
  const api3Token = useApi3Token();
  const convenience = useConvenience();
  const { provider, setChainData, userAccount } = useChainData();

  const loadDashboardData = useCallback(async () => {
    if (!provider || !api3Pool || !api3Token || !convenience || !userAccount) return null;

    const [stakingDataErr, stakingData] = await go(convenience.getUserStakingData(userAccount));
    if (stakingDataErr || !stakingData) {
      // TODO: do we want to display anything to the user if the dashboard load fails?
      notifications.error(messages.LOAD_DASHBOARD_ERROR);
      return;
    }

    const [allowanceErr, allowance] = await go(api3Token.allowance(userAccount, api3Pool.address));
    if (allowanceErr || !allowance) {
      notifications.error(messages.LOAD_DASHBOARD_ERROR);
      return;
    }

    // TODO: get this from stakingData.userApi3Balance when available
    const [ownedTokensErr, ownedTokens] = await go(api3Token.balanceOf(userAccount));
    if (ownedTokensErr || !ownedTokens) {
      notifications.error(messages.LOAD_DASHBOARD_ERROR);
      return;
    }

    setChainData('Load dashboard data', {
      dashboardState: {
        allowance,
        ownedTokens,
        // NOTE: normally we could just spread the stakingData object here, but ethers.js
        // also returns the values in an array.
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
