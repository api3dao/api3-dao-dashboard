import { BigNumber } from 'ethers';
import { useCallback, useState } from 'react';
import { useChainData } from '../../chain-data';
import { abbrStr } from '../../chain-data/helpers';
import { useApi3Pool, useApi3Token, useConvenience, useOnMinedBlockAndMount } from '../../contracts';
import { computeStakingPool, computeTokenBalances } from '../../logic/dashboard/amounts';
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
    if (!provider || !convenience || !userAccount) return null;

    const [err, stakingData] = await go(convenience.getUserStakingData(userAccount));
    if (err || !stakingData) {
      // TODO: display a toast?
      return;
    }

    const { userTotal, withdrawable } = computeTokenBalances(stakingData);
    const { currentApy, annualInflationRate, stakedPercentage } = computeStakingPool(stakingData);

    // const tokenBalances = await computeTokenBalances(api3Pool, userAccount);
    // const currentApr = await api3Pool.currentApr();
    // const annualApy = calculateApy(currentApr);
    // const totalStaked = await api3Pool.totalStake();
    // const totalSupply = await api3Token.totalSupply();
    // const stakeTarget = absoluteStakeTarget(await api3Pool.stakeTarget(), totalSupply);
    // const annualMintedTokens = calculateAnnualMintedTokens(totalStaked, annualApy);
    // const annualInflationRate = calculateAnnualInflationRate(annualMintedTokens, totalSupply);

    setChainData('Load dashboard data', {
      dashboardState: {
        api3Supply: stakingData.api3Supply,
        apr: stakingData.api3Supply,
        stakeTarget: stakingData.api3Supply,
        totalShares: stakingData.api3Supply,
        totalStake: stakingData.api3Supply,
        userLocked: stakingData.api3Supply,
        userStaked: stakingData.api3Supply,
        userTotal,
        userUnstaked: stakingData.api3Supply,
        userUnstakeAmount: stakingData.api3Supply,
        userUnstakeScheduledFor: stakingData.api3Supply,
        userUnstakeShares: stakingData.api3Supply,
        userVesting: stakingData.api3Supply,
        withdrawable,
      },
    });
  }, [provider, convenience, userAccount, setChainData]);

  useOnMinedBlockAndMount(loadDashboardData);

  const [openModal, setOpenModal] = useState<ModalType | null>(null);
  const [inputValue, setInputValue] = useState('');
  const closeModal = () => {
    setInputValue('');
    setOpenModal(null);
  };

  const disconnected = !api3Pool || !api3Token || !data;
  const canWithdraw = !disconnected && data?.withdrawable.gt(0);
  const startDate = data?.pendingUnstake ? data?.pendingUnstake.scheduledFor.getTime() : 0;
  const now = new Date().getTime();
  const isDeadline = now > startDate;

  // TODO: update according to the specifications here:
  // https://docs.google.com/document/d/1ESEkemgFOhP5_tXajhuy5Mozdm8EwU1O2YSKSBwnrUQ/edit#
  const canInitiateUnstake = !disconnected && data?.userStake.gt(0);
  const displayUnstakeCard = data?.pendingUnstake ? data?.scheduledFor === new Date(0)

  return (
    <Layout title={disconnected ? 'Welcome to the API3 DAO' : abbrStr(userAccount)} sectionTitle="Staking">
      {isDeadline && data?.pendingUnstake && <UnstakeBanner />}
      {!data?.pendingUnstake && (
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
          maxValue={data?.userStake}
        />
      </Modal>
    </Layout>
  );
};

export default Dashboard;
