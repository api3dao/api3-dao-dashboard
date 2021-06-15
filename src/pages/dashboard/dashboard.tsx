import { BigNumber } from 'ethers';
import { useState } from 'react';
import { useChainData } from '../../chain-data';
import { useApi3Pool, useApi3Token } from '../../contracts';
import { pendingUnstakeSelector, tokenBalancesSelector, useLoadDashboardData } from '../../logic/dashboard';
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

  // TODO: move this (and fields below) to the dashboard selector
  const disconnected = !api3Pool || !api3Token || !data;

  const tokenBalances = tokenBalancesSelector(data);
  const pendingUnstake = pendingUnstakeSelector(data);

  const canStake = !disconnected && data?.userUnstaked.gt(0);
  const canWithdraw = !disconnected && tokenBalances?.withdrawable.gt(0);
  const canInitiateUnstake = !disconnected && !!pendingUnstake && data?.userStaked.gt(0);

  return (
    <Layout title="Staking">
      {pendingUnstake?.canUnstake && <UnstakeBanner />}
      {!pendingUnstake?.canUnstake && (
        <>
          <p className={styles.dashboardHeader}>How This Works</p>
          <Slider />
        </>
      )}
      <p className={styles.dashboardHeader}>Staking Pool</p>
      <StakingPool />
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
                  <p className={globalStyles.textXLarge}>
                    {tokenBalances ? formatApi3(tokenBalances.userTotal) : '0.0'}
                  </p>
                </div>
                <div className={globalStyles.textCenter}>
                  <p className={styles.borderedBoxContentTitle}>withdrawable</p>
                  <p className={globalStyles.textXLarge}>
                    {tokenBalances ? formatApi3(tokenBalances.withdrawable) : '0.0'}
                  </p>
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
                <Button onClick={() => setOpenModal('stake')} disabled={!canStake}>
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
                  <p className={globalStyles.textXLarge}>
                    {tokenBalances ? formatApi3(tokenBalances.withdrawable) : '0.0'}
                  </p>
                </div>
              </>
            }
            footer={
              // TODO: In case there is a pending unstake there should be no button, just green arrow (see figma)
              <Button type="link" onClick={() => setOpenModal('unstake')} disabled={canInitiateUnstake}>
                Initiate Unstake
              </Button>
            }
          />
          {pendingUnstake && (
            <PendingUnstakePanel
              amount={pendingUnstake.tokensAtUnstakeTime}
              canUnstake={pendingUnstake.canUnstake}
              canUnstakeAndWithdraw={pendingUnstake.canUnstakeAndWithdraw}
              unstakeDate={pendingUnstake.unstakeDate}
            />
          )}
        </div>
      </div>
      <Modal open={openModal === 'deposit'} onClose={closeModal}>
        <TokenDepositForm
          allowance={data?.allowance ?? BigNumber.from('0')}
          onClose={closeModal}
          walletBalance={data?.userApi3Balance ?? BigNumber.from('0')}
        />
      </Modal>
      <Modal open={openModal === 'withdraw'} onClose={closeModal}>
        <TokenAmountForm
          title="How many tokens would you like to withdraw?"
          action="Withdraw"
          onConfirm={async (parsedValue: BigNumber) => {
            if (!api3Pool) return;
            const tx = await api3Pool.withdraw(userAccount, parsedValue);
            setChainData('Save withdraw transaction', { transactions: [...transactions, { type: 'withdraw', tx }] });
          }}
          inputValue={inputValue}
          onChange={setInputValue}
          onClose={closeModal}
          maxValue={tokenBalances?.withdrawable}
        />
      </Modal>
      <Modal open={openModal === 'stake'} onClose={closeModal}>
        <TokenAmountForm
          title="How many tokens would you like to stake?"
          action="Stake"
          onConfirm={async (parsedValue: BigNumber) => {
            if (!api3Pool) return;
            const tx = await api3Pool.stake(parsedValue);
            setChainData('Save stake transaction', { transactions: [...transactions, { type: 'stake', tx }] });
          }}
          inputValue={inputValue}
          onChange={setInputValue}
          onClose={closeModal}
          maxValue={data?.userUnstaked}
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
          maxValue={data?.userStaked}
        />
      </Modal>
      <Modal open={openModal === 'confirm-unstake'} onClose={closeModal}>
        <TokenAmountForm
          title={`Are you sure you would like to unstake ${inputValue} tokens?`}
          action="Initiate Unstaking"
          onConfirm={async (parsedValue: BigNumber) => {
            if (!api3Pool || !data) return;
            const userShares = parsedValue.mul(data.totalShares).div(data.totalStake);
            const tx = await api3Pool.scheduleUnstake(userShares);
            setChainData('Save initiate unstake transaction', {
              transactions: [...transactions, { type: 'initiate-unstake', tx }],
            });
          }}
          inputValue={inputValue}
          onChange={setInputValue}
          onClose={closeModal}
          showTokenInput={false}
        />
      </Modal>
    </Layout>
  );
};

export default Dashboard;
