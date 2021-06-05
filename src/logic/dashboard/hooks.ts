import { useCallback } from 'react';
import { useChainData } from '../../chain-data';
import { useApi3Pool, useApi3Token, useConvenience, usePossibleChainDataUpdate } from '../../contracts';
import * as notifications from '../../components/notifications/notifications';
import { go, messages } from '../../utils';
import { tokenBalancesSelector, stakingPoolSelector } from './selectors';

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

    const [ownedTokensErr, ownedTokens] = await go(api3Token.balanceOf(userAccount));
    if (ownedTokensErr || !ownedTokens) {
      notifications.error(messages.LOAD_DASHBOARD_ERROR);
      return;
    }

    // TODO: is it worth storing these selector in the state?
    const { userTotal, withdrawable } = tokenBalancesSelector(stakingData);
    const { currentApy, annualInflationRate, stakedPercentage } = stakingPoolSelector(stakingData);

    setChainData('Load dashboard data', {
      dashboardState: {
        allowance,
        annualInflationRate,
        api3Supply: stakingData.api3Supply,
        apr: stakingData.apr,
        currentApy,
        ownedTokens,
        stakedPercentage,
        stakeTarget: stakingData.stakeTarget,
        totalShares: stakingData.totalShares,
        totalStake: stakingData.totalStake,
        userLocked: stakingData.userLocked,
        userStaked: stakingData.userStaked,
        userTotal,
        userUnstaked: stakingData.userUnstaked,
        userUnstakeAmount: stakingData.userUnstakeAmount,
        userUnstakeScheduledFor: stakingData.userUnstakeScheduledFor,
        userUnstakeShares: stakingData.userUnstakeShares,
        userVesting: stakingData.userVesting,
        withdrawable,
      },
    });
  }, [provider, api3Pool, api3Token, convenience, userAccount, setChainData]);

  usePossibleChainDataUpdate(loadDashboardData);
};
