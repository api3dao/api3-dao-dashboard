import { isAfter } from 'date-fns';
import {
  absoluteStakeTarget,
  calculateAnnualInflationRate,
  calculateAnnualMintedTokens,
  calculateApy,
  min,
  max,
  totalStakedPercentage,
} from '../../contracts';
import { ConvenienceDashboardData } from '../../chain-data';
import { BigNumber } from 'ethers';

export const tokenBalancesSelector = (dashboardData: ConvenienceDashboardData | null) => {
  if (!dashboardData) return null;

  const { userLocked, userStaked, userUnstaked, userVesting } = dashboardData;
  const userTotal = userStaked.add(userUnstaked);

  const unlocked = userTotal.sub(userLocked).sub(userVesting);
  const withdrawable = max(min(unlocked, userUnstaked), BigNumber.from(0));

  return { unlocked, userTotal, withdrawable };
};

export const stakingPoolSelector = (dashboardData: ConvenienceDashboardData | null) => {
  if (!dashboardData) return null;

  const { api3Supply, apr, stakeTarget, totalStake } = dashboardData;
  const currentApy = calculateApy(apr);

  const annualMintedTokens = calculateAnnualMintedTokens(totalStake, currentApy);
  const annualInflationRate = calculateAnnualInflationRate(annualMintedTokens, api3Supply);

  const stakingTargetInTokens = absoluteStakeTarget(stakeTarget, api3Supply);
  const stakedPercentage = totalStakedPercentage(totalStake, stakingTargetInTokens);

  return { currentApy, annualInflationRate, stakingTargetInTokens, stakedPercentage };
};

export const pendingUnstakeSelector = (dashboardData: ConvenienceDashboardData | null) => {
  if (!dashboardData) return null;

  const { totalStake, totalShares, userUnstakeAmount, userUnstakeScheduledFor, userUnstakeShares } = dashboardData;

  // NOTE: userUnstakeScheduledFor === 0 is a special case indicating that the
  // user has not yet initiated an unstake. Full implementation details described here:
  // https://docs.google.com/document/d/1ESEkemgFOhP5_tXajhuy5Mozdm8EwU1O2YSKSBwnrUQ/edit#
  const hasInitiatedUnstake = userUnstakeScheduledFor.gt(0);

  // If the user has not initiated unstaking, there is no pending unstake
  if (!hasInitiatedUnstake) return null;

  // This is the earliest date the user can trigger an unstake after waiting a full epoch
  const unstakeDate = new Date(userUnstakeScheduledFor.mul(1000).toNumber());
  const now = new Date();
  const canUnstake = isAfter(now, unstakeDate);

  const tokensAtScheduleTime = userUnstakeShares.mul(totalStake).div(totalShares);
  const tokensAtUnstakeTime = min(userUnstakeAmount, tokensAtScheduleTime);

  const { unlocked } = tokenBalancesSelector(dashboardData)!;
  const canUnstakeAndWithdraw = canUnstake && unlocked.gte(tokensAtUnstakeTime);

  return { unstakeDate, tokensAtUnstakeTime, canUnstake, canUnstakeAndWithdraw };
};
