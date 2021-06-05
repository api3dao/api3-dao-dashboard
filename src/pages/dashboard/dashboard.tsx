import { BigNumber } from 'ethers';
import { useState } from 'react';
import { useChainData } from '../../chain-data';
import { abbrStr } from '../../chain-data/helpers';
import { min, useApi3Pool, useApi3Token } from '../../contracts';
import { useLoadDashboardData } from '../../logic/dashboard';
import { formatApi3 } from '../../utils';
import TokenAmountForm from './forms/token-amount-form';
import TokenDepositForm from './forms/token-deposit-form';
import Layout from '../../components/layout/layout';
import { Modal } from '../../components/modal/modal';
import Button from '../../components/button/button';
import PendingUnstakePanel from './pending-unstake-panel/pending-unstake-panel';
import StakingPool from './staking/staking-pool';
import Slider from '../../components/slider/slider';
import BorderedBox, { Header } from '../../components/bordered-box/bordered-box';
import UnstakeBanner from './unstake-banner/unstake-banner';
import globalStyles from '../../styles/global-styles.module.scss';
import styles from './dashboard.module.scss';

type ModalType = 'deposit' | 'withdraw' | 'stake' | 'unstake' | 'confirm-unstake';

const Dashboard = () => {
  const { dashboardState: data, userAccount, transactions, setChainData } = useChainData();
  const api3Pool = useApi3Pool();
  const api3Token = useApi3Token();

  useLoadDashboardData();

  const [openModal, setOpenModal] = useState<ModalType | null>(null);
  const [inputValue, setInputValue] = useState('');
  const closeModal = () => {
    setInputValue('');
    setOpenModal(null);
  };

  const disconnected = !api3Pool || !api3Token || !data;
  const canWithdraw = (!disconnected && data?.withdrawable.gt(0)) ?? false;

  // userUnstakeScheduledFor === 0 is a special case indicating that the user has not yet initiated an unstake
  const isUnstakePending = data?.userUnstakeScheduledFor.gt(0) ?? false;

  const unstakeDate = new Date(data?.userUnstakeScheduledFor.mul(1000).toNumber() || 0);
  const now = new Date().getTime();
  const hasUnstakeDelayPassed = now > unstakeDate.getTime();
  const isUnstakeReady = isUnstakePending && hasUnstakeDelayPassed;

  const unstakePercentage = data?.userUnstakeShares.mul(data.totalStake).div(data.totalShares) ?? BigNumber.from(0);
  const minimumUnstakeAmount = data ? min(data.userUnstakeAmount, unstakePercentage) : BigNumber.from(0);

  return (
    <Layout title={disconnected ? 'Welcome to the API3 DAO' : abbrStr(userAccount)} sectionTitle="Staking">
      {isUnstakeReady && <UnstakeBanner />}
      {!isUnstakeReady && (
        <>
          <h5 className={globalStyles.greenColor}>How This Works</h5>
          <Slider />
        </>
      )}
      <h5 className={globalStyles.greenColor}>Staking Pool</h5>
      <StakingPool data={data || undefined} />
      <div className={styles.borderedBoxesWrap}>
        <div className={styles.stakingBoxWrap}>
          <BorderedBox
            header={
              <Header>
                <h5>Balance</h5>
                <Button onClick={() => setOpenModal('deposit')} disabled={disconnected}>
                  + Deposit
                </Button>
              </Header>
            }
            content={
              <>
                <div className={`${globalStyles.textCenter} ${globalStyles.mbLg}`}>
                  <p className={styles.borderedBoxContentTitle}>total</p>
                  <p className={globalStyles.textXLarge}>{data ? formatApi3(data.userTotal) : '0.0'}</p>
                </div>
                <div className={globalStyles.textCenter}>
                  <p className={styles.borderedBoxContentTitle}>withdrawable</p>
                  <p className={globalStyles.textXLarge}>{data ? formatApi3(data.withdrawable) : '0.0'}</p>
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
        <div className={styles.stakingBoxWrap}>
          <BorderedBox
            header={
              <Header>
                <h5>Staking</h5>
                <Button onClick={() => setOpenModal('stake')} disabled={disconnected}>
                  + Stake
                </Button>
              </Header>
            }
            content={
              <>
                <div className={`${globalStyles.textCenter} ${globalStyles.mbLg}`}>
                  <p className={styles.borderedBoxContentTitle}>staked</p>
                  <p className={globalStyles.textXLarge}>{data ? formatApi3(data.userStaked) : '0.0'}</p>
                </div>
                <div className={globalStyles.textCenter}>
                  <p className={styles.borderedBoxContentTitle}>unstaked</p>
                  <p className={globalStyles.textXLarge}>{data ? formatApi3(data.withdrawable) : '0.0'}</p>
                </div>
              </>
            }
            footer={
              <Button type="link" onClick={() => setOpenModal('unstake')} disabled={isUnstakePending}>
                Initiate Unstake
              </Button>
            }
          />
          {data && isUnstakePending && (
            <PendingUnstakePanel amount={minimumUnstakeAmount} scheduledFor={data.userUnstakeScheduledFor} />
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
