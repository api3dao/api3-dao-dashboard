import { BigNumber } from '@ethersproject/bignumber';
import last from 'lodash/last';
import { useCallback } from 'react';
import { useChainData } from './chain-data';
import { useApi3Pool, useApi3Token } from './contracts';
import { Api3Pool } from './generated-contracts';
import { usePromise } from './utils/usePromise';

const computeTokenBalances = async (api3Pool: Api3Pool, userAccount: string) => {
  const poolFilters = [
    api3Pool.filters.Deposited(userAccount, null),
    api3Pool.filters.Withdrawn(userAccount, null, null),
    api3Pool.filters.Staked(userAccount, null, null),
    api3Pool.filters.Unstaked(userAccount, null, null),
  ] as const;

  const sum = (values: BigNumber[]) => values.reduce((acc, x) => acc.add(x), BigNumber.from(0));
  const [deposits, withdraws, stakes, unstakes] = (
    await Promise.all(poolFilters.map((filter) => api3Pool.queryFilter(filter)))
  )
    .map((events) => events.map((event) => event.args.amount))
    .flatMap(sum);

  const balance = BigNumber.from(0).add(deposits).sub(withdraws);
  return {
    balance,
    withdrawable: balance.sub(stakes).add(unstakes),
  };
};

const getScheduledUnstakes = async (api3Pool: Api3Pool, userAccount: string) => {
  const scheduledUnstakeFilter = api3Pool.filters.ScheduledUnstake(userAccount, null, null);

  const lastUnstake = last(await api3Pool.queryFilter(scheduledUnstakeFilter));
  if (!lastUnstake) return 'No scheduled pending unstake';

  const unstakedFilter = api3Pool.filters.Unstaked(userAccount, null, null);
  const unstakedEvents = await api3Pool.queryFilter(unstakedFilter, lastUnstake.blockNumber);
  if (unstakedEvents.length > 0) {
    return 'Already unstaked (no pending unstakes)';
  }

  const epochLength = await api3Pool.EPOCH_LENGTH();
  const scheduledFor = lastUnstake.args.scheduledFor;

  const toDate = (timestamp: BigNumber) => new Date(timestamp.toNumber()).toUTCString();

  return JSON.stringify({
    amount: lastUnstake.args.amount.toString(),
    scheduledFor: toDate(scheduledFor.mul(1000)),
    deadline: toDate(scheduledFor.add(epochLength)),
  });
};

const DashboardPanels = () => {
  const { userAccount, provider } = useChainData();
  const api3Pool = useApi3Pool();
  const api3Token = useApi3Token();

  const loadData = useCallback(async () => {
    if (!api3Pool || !api3Token || !provider) return null;

    const tokenBalances = await computeTokenBalances(api3Pool, userAccount);

    return {
      ethBalance: await provider.getSigner().getBalance(),
      ownedTokens: await api3Token.balanceOf(userAccount),
      balance: tokenBalances.balance,
      withdrawable: tokenBalances.withdrawable,
      userStake: await api3Pool.userStake(userAccount),
      pendingUnstakes: await getScheduledUnstakes(api3Pool, userAccount),
    };
  }, [api3Pool, api3Token, userAccount, provider]);

  // TODO: handle error
  const [_error, data] = usePromise(loadData);

  if (!api3Pool || !api3Token) return null;
  if (!data) return null;

  return (
    <div style={{ margin: 200 }}>
      <div>
        <h5>Balance</h5>

        {/* TODO: remove this */}
        <p>ETH balance: {data.ethBalance.toString()}</p>

        <p>Owned tokens outside pool: {data.ownedTokens.toString()}</p>
        <p>Total: {data.balance.toString()}</p>
        <p>Withdrawable: {data.withdrawable.toString()}</p>
        <p>
          <button
            onClick={() => {
              // TODO: is this correct?
              const maxAllowance = BigNumber.from(2).pow(256).sub(1);

              // TODO: handle errors
              api3Token.approve(api3Pool.address, maxAllowance);
            }}
          >
            Approve infinite deposit to pool
          </button>
        </p>
        <p>
          <button
            onClick={() => {
              // TODO: handle errors
              api3Pool.deposit(userAccount, 10, userAccount);
            }}
          >
            Deposit 10 tokens
          </button>
        </p>
        <p>
          <button
            onClick={() => {
              // TODO: handle errors
              api3Pool.withdraw(userAccount, 10);
            }}
          >
            Withdraw
          </button>
        </p>
      </div>
      <div>
        <h5>Staking</h5>

        <p>Staked: {data.userStake.toString()}</p>
        {/* TODO: is this correct? */}
        <p>Unstaked: {data.withdrawable.toString()}</p>
        <p>
          <button
            onClick={() => {
              // TODO: handle errors
              api3Pool.stake('10');
            }}
          >
            Stake 10
          </button>
        </p>
        <p>
          <button
            onClick={async () => {
              // TODO: handle errors
              const res = await api3Pool.scheduleUnstake('10');
              console.log('Unstaking scheduled', res);
            }}
          >
            Unstake 10
          </button>
        </p>
        <p>Scheduled unstake: {data.pendingUnstakes}</p>
      </div>
    </div>
  );
};

export default DashboardPanels;
