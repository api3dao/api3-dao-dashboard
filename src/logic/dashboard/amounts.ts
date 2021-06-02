// import { BigNumber } from 'ethers';
// import last from 'lodash/last';
import {
  absoluteStakeTarget,
  calculateAnnualInflationRate,
  calculateAnnualMintedTokens,
  calculateApy,
  min,
  totalStakedPercentage,
} from '../../contracts';
// import { formatApi3 } from '../../utils';
import { UserStakingData } from '../../chain-data';

export const computeTokenBalances = (stakingData: UserStakingData) => {
  const { userLocked, userStaked, userUnstaked, userVesting } = stakingData;
  const userTotal = userStaked.add(userUnstaked);

  const unlocked = userTotal.sub(userLocked).sub(userVesting);
  const withdrawable = min(unlocked, userUnstaked);

  return { userTotal, withdrawable };
};

export const computeStakingPool = (stakingData: UserStakingData) => {
  const { api3Supply, apr, stakeTarget, totalStake } = stakingData;
  const currentApy = calculateApy(apr);

  const annualMintedTokens = calculateAnnualMintedTokens(totalStake, currentApy);
  const annualInflationRate = calculateAnnualInflationRate(annualMintedTokens, api3Supply);

  const stakingTarget = absoluteStakeTarget(stakeTarget, api3Supply);
  const stakedPercentage = totalStakedPercentage(totalStake, stakingTarget);

  return { currentApy, annualInflationRate, stakedPercentage };
};

// export const getScheduledUnstake = async (api3Pool: Api3Pool, userAccount: string) => {
//   const scheduledUnstakeFilter = api3Pool.filters.ScheduledUnstake(userAccount, null, null, null);
//
//   const lastUnstake = last(await api3Pool.queryFilter(scheduledUnstakeFilter));
//   if (!lastUnstake) return null;
//
//   const unstakedFilter = api3Pool.filters.Unstaked(userAccount, null);
//   const unstakedEvents = await api3Pool.queryFilter(unstakedFilter, lastUnstake.blockNumber);
//   if (unstakedEvents.length > 0) {
//     return null;
//   }
//
//   const epochLength = await api3Pool.EPOCH_LENGTH();
//   const scheduledFor = lastUnstake.args.scheduledFor;
//
//   const toDate = (timestamp: BigNumber) => new Date(timestamp.toNumber());
//
//   return {
//     amount: formatApi3(lastUnstake.args.amount),
//     scheduledFor: toDate(scheduledFor.mul(1000)),
//     deadline: toDate(scheduledFor.add(epochLength).mul(1000)),
//   };
// };
