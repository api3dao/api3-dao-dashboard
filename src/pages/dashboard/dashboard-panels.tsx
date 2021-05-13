import { BigNumber } from '@ethersproject/bignumber';
import last from 'lodash/last';
import { useCallback } from 'react';
import { useChainData } from '../../chain-data';
import {
  absoluteStakeTarget,
  ALLOWANCE_REFILL_TRESHOLD,
  calculateAnnualInflationRate,
  calculateAnnualMintedTokens,
  calculateApy,
  MAX_ALLOWANCE,
  min,
  totalStakedPercentage,
  useApi3Pool,
  useApi3Token,
} from '../../contracts';
import { Api3Pool } from '../../generated-contracts';
import { usePromise } from '../../utils/usePromise';
import { formatApi3, parseApi3 } from '../../utils/api3-format';
import { unusedHookDependency } from '../../utils/hooks';
import { TokenAmountModal } from '../../components/modal/modal';
import { useState } from 'react';

const computeTokenBalances = async (api3Pool: Api3Pool, userAccount: string) => {
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
    amount: lastUnstake.args.amount,
    scheduledFor: toDate(scheduledFor.mul(1000)),
    deadline: toDate(scheduledFor.add(epochLength)),
  });
};

const DashboardPanels = () => {
  const { userAccount, provider, latestBlock } = useChainData();
  const api3Pool = useApi3Pool();
  const api3Token = useApi3Token();

  // The implementation follows https://api3workspace.slack.com/archives/C020RCCC3EJ/p1620563619008200
  const loadData = useCallback(async () => {
    if (!api3Pool || !api3Token || !provider) return null;
    unusedHookDependency(latestBlock);

    const tokenBalances = await computeTokenBalances(api3Pool, userAccount);
    const currentApr = await api3Pool.currentApr();
    const annualApy = calculateApy(currentApr);
    const totalStaked = await api3Pool.totalStake();
    const totalSupply = await api3Token.totalSupply();
    const stakeTarget = absoluteStakeTarget(await api3Pool.stakeTarget(), totalSupply);
    const annualMintedTokens = calculateAnnualMintedTokens(totalStaked, annualApy);
    const annualInflationRate = calculateAnnualInflationRate(annualMintedTokens, totalSupply);

    return {
      ownedTokens: formatApi3(await api3Token.balanceOf(userAccount)),
      balance: formatApi3(tokenBalances.balance),
      withdrawable: formatApi3(tokenBalances.withdrawable),
      userStake: formatApi3(await api3Pool.userStake(userAccount)),
      stakeTarget: formatApi3(stakeTarget),
      totalStaked: formatApi3(totalStaked),
      pendingUnstakes: await getScheduledUnstakes(api3Pool, userAccount),
      annualApy: annualApy.toString(),
      annualInflationRate: annualInflationRate.toString(),
      totalStakedPercentage: totalStakedPercentage(totalStaked, stakeTarget),
      allowance: await api3Token.allowance(userAccount, api3Pool.address),
    };
  }, [api3Pool, api3Token, userAccount, provider, latestBlock]);

  // TODO: handle error
  const [_error, data] = usePromise(loadData);
  const [openModal, setOpenModal] = useState<string | null>(null);
  const closeModal = () => setOpenModal(null);

  if (!api3Pool || !api3Token) return null;
  if (!data) return null;

  return (
    <div style={{ margin: 200 }}>
      <div>
        <h5>Account</h5>

        <p>User account: {userAccount}</p>
      </div>
      <div>
        <h5>Insurance pool</h5>

        <p>Annual rewards APY: {data.annualApy}</p>
        <p>Annual inflation rate: {data.annualInflationRate}</p>
        <p>Total staked: {data.totalStaked}</p>
        <p>Stake target: {data.stakeTarget}</p>
        <p>Stake target in %: {data.totalStakedPercentage}</p>
      </div>
      <div>
        <h5>Balance</h5>

        <p>Owned tokens outside pool: {data.ownedTokens}</p>
        <p>Total: {data.balance}</p>
        <p>Withdrawable: {data.withdrawable}</p>
        {data.allowance.lt(ALLOWANCE_REFILL_TRESHOLD) ? (
          <p>
            <button
              onClick={() => {
                // TODO: handle errors
                api3Token.approve(api3Pool.address, MAX_ALLOWANCE);
              }}
            >
              Approve infinite deposit to pool
            </button>
          </p>
        ) : (
          <p>
            <button onClick={() => setOpenModal('deposit')}>Deposit</button>
            <TokenAmountModal
              title="How many tokens would you like to deposit?"
              open={openModal === 'deposit'}
              onClose={closeModal}
              action="Deposit"
              onConfirm={(tokens) => {
                // TODO: handle errors
                api3Pool.deposit(userAccount, parseApi3(tokens), userAccount);
              }}
            />
          </p>
        )}
        <p>
          <button onClick={() => setOpenModal('withdraw')}>Withdraw</button>
          <TokenAmountModal
            title="How many tokens would you like to withdraw?"
            open={openModal === 'withdraw'}
            onClose={closeModal}
            action="Withdraw"
            onConfirm={(tokens) => {
              // TODO: handle errors
              api3Pool.withdraw(userAccount, parseApi3(tokens));
            }}
          />
        </p>
      </div>
      <div>
        <h5>Staking</h5>

        <p>Staked: {data.userStake}</p>
        <p>Unstaked: {data.withdrawable}</p>
        <p>
          <button onClick={() => setOpenModal('stake')}>Stake</button>
          <TokenAmountModal
            title="How many tokens would you like to stake?"
            open={openModal === 'stake'}
            onClose={closeModal}
            action="Stake"
            onConfirm={(tokens) => {
              // TODO: handle errors
              api3Pool.stake(parseApi3(tokens));
            }}
          />
        </p>
        <p>
          <button onClick={() => setOpenModal('unstake')}>Unstake</button>
          <TokenAmountModal
            title="How many tokens would you like to unstake?"
            open={openModal === 'unstake'}
            onClose={closeModal}
            action="Unstake"
            onConfirm={async (tokens) => {
              // TODO: handle errors
              const res = await api3Pool.scheduleUnstake(parseApi3(tokens));
              console.log('Unstaking scheduled', res);
            }}
          />
        </p>
        <p>Scheduled unstake: {data.pendingUnstakes}</p>
      </div>
    </div>
  );
};

export default DashboardPanels;