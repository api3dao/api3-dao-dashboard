import { BigNumber } from 'ethers';
import { useCallback, useState } from 'react';
import { useChainData } from '../../chain-data';
import { abbrStr } from '../../chain-data/helpers';
import { useApi3Pool, useApi3Token, useConvenience, usePossibleChainDataUpdate } from '../../contracts';
import { computeTokenBalances, computeStakingPool } from '../../logic/dashboard/amounts';
import { formatApi3, go } from '../../utils';
import TokenAmountForm from './forms/token-amount-form';
import TokenDepositForm from './forms/token-deposit-form';
import Layout from '../../components/layout/layout';
import { Modal } from '../../components/modal/modal';
import Button from '../../components/button/button';
import PendingUnstakePanel from './pending-unstake-panel/pending-unstake-panel';
import StakingPool from './staking/staking-pool';
import Slider from '../../components/slider/slider';
import BorderedBox from '../../components/bordered-box/bordered-box';
import UnstakeBanner from './unstake-banner/unstake-banner';
import './dashboard.scss';

type ModalType = 'deposit' | 'withdraw' | 'stake' | 'unstake' | 'confirm-unstake';

const Dashboard = () => {
  const { dashboardState: data, userAccount, provider, transactions, setChainData } = useChainData();
  const api3Pool = useApi3Pool();
  const api3Token = useApi3Token();
  const convenience = useConvenience();

  // Load the data again on every block (10 - 20 seconds on average). This will also run
  // immediately if the user is already on the dashboard and they have just connected.
  // The implementation follows https://api3workspace.slack.com/archives/C020RCCC3EJ/p1620563619008200
  const loadDashboardData = useCallback(async () => {
    if (!provider || !api3Pool || !api3Token || !convenience || !userAccount) return null;

    const [stakingDataErr, stakingData] = await go(convenience.getUserStakingData(userAccount));
    if (stakingDataErr || !stakingData) {
      // TODO: notifications.error('Failed to load dashboard data');
      return;
    }

    const [allowanceErr, allowance] = await go(api3Token.allowance(userAccount, api3Pool.address));
    if (allowanceErr || !allowance) {
      // TODO: notifications.error('Failed to load dashboard data');
      return;
    }

    const [ownedTokensErr, ownedTokens] = await go(api3Token.balanceOf(userAccount));
    if (ownedTokensErr || !ownedTokens) {
      // TODO: notifications.error('Failed to load dashboard data');
      return;
    }

    const { userTotal, withdrawable } = computeTokenBalances(stakingData);
    const { currentApy, annualInflationRate, stakedPercentage } = computeStakingPool(stakingData);

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

  const [openModal, setOpenModal] = useState<ModalType | null>(null);
  const [inputValue, setInputValue] = useState('');
  const closeModal = () => {
    setInputValue('');
    setOpenModal(null);
  };

  const disconnected = !api3Pool || !api3Token || !data;
  const canWithdraw = !disconnected && data?.withdrawable.gt(0);

  // userUnstakeScheduledFor === 0 is a special case indicating that the user has not yet initiated an unstake
  const isUnstakePending = data?.userUnstakeScheduledFor.gt(BigNumber.from(0));

  const unstakeDate = new Date(data?.userUnstakeScheduledFor.mul(1000).toNumber() || 0);
  const now = new Date().getTime();
  const hasUnstakeDelayPassed = now > unstakeDate.getTime();
  const isUnstakeReady = isUnstakePending && hasUnstakeDelayPassed;

  return (
    <Layout title={disconnected ? 'Welcome to the API3 DAO' : abbrStr(userAccount)} sectionTitle="Staking">
      {isUnstakeReady && <UnstakeBanner />}
      {!isUnstakeReady && (
        <>
          <h5 className="green-color">How This Works</h5>
          <Slider />
        </>
      )}
      <h5 className="green-color">Staking Pool</h5>
      <StakingPool data={data || undefined} />
      <div className="bordered-boxes-wrap">
        <div className="staking-box-wrap">
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
                  <p className="text-xlarge">{data ? formatApi3(data.userTotal) : '0.0'}</p>
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
        </div>
        <div className="staking-box-wrap">
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
                  <p className="text-xlarge">{data ? formatApi3(data.userStaked) : '0.0'}</p>
                </div>
                <div className="bordered-box-data">
                  <p className="text-small secondary-color uppercase medium">unstaked</p>
                  <p className="text-xlarge">{data ? formatApi3(data.withdrawable) : '0.0'}</p>
                </div>
              </>
            }
            footer={
              <Button type="link" onClick={() => setOpenModal('unstake')} disabled={!isUnstakePending}>
                Initiate Unstake
              </Button>
            }
          />
          {data && isUnstakePending && (
            <PendingUnstakePanel amount={data.userUnstakeAmount} scheduledFor={data.userUnstakeScheduledFor} />
          )}
        </div>
      </div>
      <Modal open={openModal === 'deposit'} onClose={closeModal}>
        <TokenDepositForm
          allowance={data?.allowance || BigNumber.from('0')}
          balance={data?.ownedTokens || BigNumber.from('0')}
          onClose={closeModal}
        />
      </Modal>
      <Modal open={openModal === 'withdraw'} onClose={closeModal}>
        <TokenAmountForm
          title="How many tokens would you like to withdraw?"
          action="Withdraw"
          onConfirm={async (parsedValue: BigNumber) => {
            if (!api3Pool) return;
            const tx = await api3Pool.withdraw(userAccount, parsedValue);
            setChainData('Save withdraw transaction', { transactions: [...transactions, tx] });
          }}
          inputValue={inputValue}
          onChange={setInputValue}
          onClose={closeModal}
          maxValue={data?.withdrawable}
        />
      </Modal>
      <Modal open={openModal === 'stake'} onClose={closeModal}>
        <TokenAmountForm
          title="How many tokens would you like to stake?"
          action="Stake"
          onConfirm={async (parsedValue: BigNumber) => {
            if (!api3Pool) return;
            const tx = await api3Pool.stake(parsedValue);
            setChainData('Save stake transaction', { transactions: [...transactions, tx] });
          }}
          inputValue={inputValue}
          onChange={setInputValue}
          onClose={closeModal}
          maxValue={data?.withdrawable}
        />
      </Modal>
      <Modal open={openModal === 'unstake'} onClose={closeModal}>
        <TokenAmountForm
          title="How many tokens would you like to unstake?"
          action="Initiate Unstaking"
          onConfirm={async () => setOpenModal('confirm-unstake')}
          inputValue={inputValue}
          onChange={setInputValue}
          onClose={closeModal}
          closeOnConfirm={false}
        />
      </Modal>
      <Modal open={openModal === 'confirm-unstake'} onClose={closeModal}>
        <TokenAmountForm
          title={`Are you sure you would like to unstake ${inputValue} tokens?`}
          action="Initiate Unstaking"
          onConfirm={async (parsedValue: BigNumber) => {
            if (!api3Pool) return;
            const tx = await api3Pool.scheduleUnstake(parsedValue);
            setChainData('Save unstake transaction', { transactions: [...transactions, tx] });
          }}
          inputValue={inputValue}
          onChange={setInputValue}
          onClose={closeModal}
          showTokenInput={false}
          maxValue={data?.userStaked}
        />
      </Modal>
    </Layout>
  );
};

export default Dashboard;
