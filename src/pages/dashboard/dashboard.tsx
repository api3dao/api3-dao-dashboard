import { BigNumber } from '@ethersproject/bignumber';
import last from 'lodash/last';
import { useCallback, useEffect, useState } from 'react';
import { useChainData } from '../../chain-data';
import {
  absoluteStakeTarget,
  calculateAnnualInflationRate,
  calculateAnnualMintedTokens,
  calculateApy,
  min,
  totalStakedPercentage,
  useApi3Pool,
  useApi3Token,
} from '../../contracts';
import { Api3Pool } from '../../generated-contracts';
import { formatApi3, unusedHookDependency } from '../../utils';
import TokenAmountModal from './modals/token-amount-modal';
import TokenDepositModal from './modals/token-deposit-modal';
import Layout from '../../components/layout/layout';
import Button from '../../components/button/button';
import PendingUnstakePanel from './pending-unstake-panel/pending-unstake-panel';
import StakingPool from './staking/staking-pool';
import Slider from '../../components/slider/slider';
import BorderedBox from '../../components/bordered-box/bordered-box';
import './dashboard.scss';

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

const getScheduledUnstake = async (api3Pool: Api3Pool, userAccount: string) => {
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

type ModalType = 'deposit' | 'withdraw' | 'stake' | 'unstake' | 'confirm-unstake';

const Dashboard = () => {
  const chainData = useChainData();
  const { dashboardState: data, userAccount, provider, latestBlock, transactions, setChainData } = chainData;
  const api3Pool = useApi3Pool();
  const api3Token = useApi3Token();

  // Load the data again on every block (10 - 20 seconds on average). This will also run
  // immediately if the user is already on the dashboard and they have just connected.
  // The implementation follows https://api3workspace.slack.com/archives/C020RCCC3EJ/p1620563619008200
  const loadDashboardData = useCallback(async () => {
    if (!api3Pool || !api3Token || !provider || !userAccount) return null;
    unusedHookDependency(latestBlock);

    const tokenBalances = await computeTokenBalances(api3Pool, userAccount);
    const currentApr = await api3Pool.currentApr();
    const annualApy = calculateApy(currentApr);
    const totalStaked = await api3Pool.totalStake();
    const totalSupply = await api3Token.totalSupply();
    const stakeTarget = absoluteStakeTarget(await api3Pool.stakeTarget(), totalSupply);
    const annualMintedTokens = calculateAnnualMintedTokens(totalStaked, annualApy);
    const annualInflationRate = calculateAnnualInflationRate(annualMintedTokens, totalSupply);

    setChainData({
      dashboardState: {
        allowance: await api3Token.allowance(userAccount, api3Pool.address),
        annualApy,
        annualInflationRate,
        balance: tokenBalances.balance,
        ownedTokens: await api3Token.balanceOf(userAccount),
        pendingUnstake: await getScheduledUnstake(api3Pool, userAccount),
        stakeTarget,
        totalStaked,
        totalStakedPercentage: totalStakedPercentage(totalStaked, stakeTarget),
        userStake: await api3Pool.userStake(userAccount),
        withdrawable: tokenBalances.withdrawable,
      },
    });
  }, [provider, api3Pool, api3Token, latestBlock, userAccount]); // eslint-disable-line react-hooks/exhaustive-deps

  // If the user is navigating to the dashboard from another page, and they
  // are already connected, refresh the data immediately.
  useEffect(() => {
    loadDashboardData();
  }, [loadDashboardData]);

  const [openModal, setOpenModal] = useState<ModalType | null>(null);
  const [inputValue, setInputValue] = useState('');
  const closeModal = () => setOpenModal(null);

  const disconnected = !api3Pool || !api3Token || !data;
  const canWithdraw = !disconnected && data?.withdrawable.gt(0);

  // TODO: update according to the specifications here:
  // https://docs.google.com/document/d/1ESEkemgFOhP5_tXajhuy5Mozdm8EwU1O2YSKSBwnrUQ/edit#
  const canInitiateUnstake = !disconnected && data?.userStake.gt(0);

  const abbrStr = (str: string) => {
    return str.substr(0, 9) + '...' + str.substr(str.length - 4, str.length);
  };

  return (
    <Layout title={disconnected ? 'Welcome to the API3 DAO' : abbrStr(userAccount)} sectionTitle="Staking">
      {disconnected && (
        <>
          <h5 className="green-color">How This Works</h5>
          <Slider />
        </>
      )}
      <h5 className="green-color">Staking Pool</h5>
      <StakingPool data={data || undefined} />
      <div className="bordered-boxes">
        <BorderedBox
          header={
            <div className="bordered-box-header">
              <h5>Balance</h5>
              <Button onClick={() => setOpenModal('deposit')} disabled={disconnected}>
                + Deposit
              </Button>
            </div>
          }
          content={
            <>
              <div className="bordered-box-data">
                <p className="text-small secondary-color uppercase medium">total</p>
                <p className="text-xlarge">{data ? formatApi3(data.balance) : '0.0'}</p>
              </div>
              <div className="bordered-box-data">
                <p className="text-small secondary-color uppercase medium">withdrawable</p>
                <p className="text-xlarge">{data ? formatApi3(data.withdrawable) : '0.0'}</p>
              </div>
            </>
          }
          footer={
            <Button type="link" onClick={() => setOpenModal('withdraw')} disabled={!canWithdraw}>
              Withdraw
            </Button>
          }
        />
        <div className="staking-boxes">
          <BorderedBox
            header={
              <div className="bordered-box-header">
                <h5>Staking</h5>
                <Button onClick={() => setOpenModal('stake')} disabled={disconnected}>
                  + Stake
                </Button>
              </div>
            }
            content={
              <>
                <div className="bordered-box-data">
                  <p className="text-small secondary-color uppercase medium">staked</p>
                  <p className="text-xlarge">{data ? formatApi3(data.userStake) : '0.0'}</p>
                </div>
                <div className="bordered-box-data">
                  <p className="text-small secondary-color uppercase medium">unstaked</p>
                  <p className="text-xlarge">{data ? formatApi3(data.withdrawable) : '0.0'}</p>
                </div>
              </>
            }
            footer={
              <Button type="link" onClick={() => setOpenModal('unstake')} disabled={!canInitiateUnstake}>
                Initiate Unstake
              </Button>
            }
          />
          {data?.pendingUnstake && (
            <PendingUnstakePanel
              amount={data.pendingUnstake.amount.toString()}
              scheduledFor={data.pendingUnstake.scheduledFor}
              deadline={data.pendingUnstake.deadline}
            />
          )}
        </div>
      </div>
      <TokenDepositModal
        allowance={data?.allowance || BigNumber.from('0')}
        balance={data?.ownedTokens || BigNumber.from('0')}
        open={openModal === 'deposit'}
        onClose={closeModal}
      />
      <TokenAmountModal
        title="How many tokens would you like to withdraw?"
        open={openModal === 'withdraw'}
        onClose={closeModal}
        action="Withdraw"
        onConfirm={async (parsedValue: BigNumber) => {
          const tx = await api3Pool?.withdraw(userAccount, parsedValue);
          if (tx) {
            setChainData({ ...chainData, transactions: [...transactions, tx] });
          }
        }}
        inputValue={inputValue}
        onChange={(e) => setInputValue(e.target.value)}
        maxValue={data?.withdrawable}
      />
      <TokenAmountModal
        title="How many tokens would you like to stake?"
        open={openModal === 'stake'}
        onClose={closeModal}
        action="Stake"
        onConfirm={async (parsedValue: BigNumber) => {
          const tx = await api3Pool?.stake(parsedValue);
          if (tx) {
            setChainData({ ...chainData, transactions: [...transactions, tx] });
          }
        }}
        inputValue={inputValue}
        onChange={(e) => setInputValue(e.target.value)}
        maxValue={data?.withdrawable}
      />
      <TokenAmountModal
        title="How many tokens would you like to unstake?"
        open={openModal === 'unstake'}
        onClose={closeModal}
        action="Initiate Unstaking"
        onConfirm={async () => setOpenModal('confirm-unstake')}
        inputValue={inputValue}
        onChange={(e) => setInputValue(e.target.value)}
        closeOnConfirm={false}
      />
      <TokenAmountModal
        title={`Are you sure you would like to unstake ${inputValue} tokens?`}
        open={openModal === 'confirm-unstake'}
        onClose={closeModal}
        action="Initiate Unstaking"
        onConfirm={async (parsedValue: BigNumber) => {
          const tx = await api3Pool?.scheduleUnstake(parsedValue);
          if (tx) {
            setChainData({ ...chainData, transactions: [...transactions, tx] });
          }
        }}
        inputValue={inputValue}
        onChange={(e) => setInputValue(e.target.value)}
        showTokenInput={false}
        maxValue={data?.userStake}
      />
    </Layout>
  );
};

export default Dashboard;
