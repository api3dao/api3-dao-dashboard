import { BigNumber } from 'ethers';
import last from 'lodash/last';
import { Api3Pool } from '../../generated-contracts';
import { min } from '../../contracts';
import { formatApi3 } from '../../utils';

export const computeTokenBalances = async (api3Pool: Api3Pool, userAccount: string) => {
  const user = await api3Pool.users(userAccount);
  const staked = await api3Pool.userStake(userAccount);
  const unstaked = user.unstaked;
  const balance = staked.add(unstaked);

  const userLocked = await api3Pool.getUserLocked(userAccount);
  const lockedAndVesting = userLocked.add(user.vesting);
  const withdrawable = min(unstaked, balance.sub(lockedAndVesting));

  return {
    balance,
    withdrawable,
  };
};

export const getScheduledUnstake = async (api3Pool: Api3Pool, userAccount: string) => {
  const scheduledUnstakeFilter = api3Pool.filters.ScheduledUnstake(userAccount, null, null, null);

  const lastUnstake = last(await api3Pool.queryFilter(scheduledUnstakeFilter));
  if (!lastUnstake) return null;

  const unstakedFilter = api3Pool.filters.Unstaked(userAccount, null);
  const unstakedEvents = await api3Pool.queryFilter(unstakedFilter, lastUnstake.blockNumber);
  if (unstakedEvents.length > 0) {
    return null;
  }

  const epochLength = await api3Pool.EPOCH_LENGTH();
  const scheduledFor = lastUnstake.args.scheduledFor;

  const toDate = (timestamp: BigNumber) => new Date(timestamp.toNumber());

  return {
    amount: formatApi3(lastUnstake.args.amount),
    scheduledFor: toDate(scheduledFor.mul(1000)),
    deadline: toDate(scheduledFor.add(epochLength).mul(1000)),
  };
};
