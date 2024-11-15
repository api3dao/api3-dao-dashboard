import { BigNumber } from 'ethers';
import { useState } from 'react';
import { useChainData } from '../../chain-data';
import { useApi3Pool } from '../../contracts';
import { pendingUnstakeSelector, tokenBalancesSelector, useLoadDashboardData } from '../../logic/dashboard';
import { formatAndRoundApi3, handleTransactionError, images, UNKNOWN_NUMBER } from '../../utils';
import TokenAmountForm from './forms/token-amount-form';
import TokenDepositForm from './forms/token-deposit-form';
import Layout from '../../components/layout';
import { Modal } from '../../components/modal';
import Button from '../../components/button';
import { Tooltip } from '../../components/tooltip';
import PendingUnstakePanel from './pending-unstake-panel/pending-unstake-panel';
import StakingPool from './staking/staking-pool';
import Card, { Header as CardHeader } from '../../components/card/card';
import UnstakeBanner from './unstake-banner/unstake-banner';
import styles from './dashboard.module.scss';
import ConfirmUnstakeForm from './forms/confirm-unstake-form';
import classNames from 'classnames';
import ConnectButton from '../../components/connect-button';

type ModalType = 'deposit' | 'withdraw' | 'stake' | 'unstake' | 'confirm-unstake';

const Dashboard = () => {
  const { dashboardState: data, transactions, setChainData, signer, provider } = useChainData();
  const api3Pool = useApi3Pool();

  useLoadDashboardData();

  const [openModal, setOpenModal] = useState<ModalType | null>(null);
  const [inputValue, setInputValue] = useState('');
  const [confirmUnstakeAmount, setConfirmUnstakeAmount] = useState<BigNumber | null>(null);
  const closeModal = () => {
    setInputValue('');
    setOpenModal(null);
  };

  const tokenBalances = tokenBalancesSelector(data);
  const pendingUnstake = pendingUnstakeSelector(data);

  const canStake = data && data.userUnstaked.gt(0);
  const canWithdraw = tokenBalances && tokenBalances.withdrawable.gt(0);
  const canInitiateUnstake = data && !pendingUnstake && data.userStaked.gt(0);

  return (
    <Layout title="Staking">
      {pendingUnstake?.canUnstake && <UnstakeBanner canUnstakeAndWithdraw={pendingUnstake.canUnstakeAndWithdraw} />}
      {!provider && (
        <>
          {/* Connect Wallet */}
          <div className={styles.connectWalletBox} data-cy="connect-wallet-staking">
            <div className={styles.connectWalletBoxContent}>
              <img src={images.infoCircle} alt="connect wallet info" />
              <div className={styles.connectWalletBoxText}>
                <span className={styles.connectWalletBoxTitle}>Connect your Wallet.</span>
                <span className={styles.connectWalletBoxSubtitle}>Connect wallet to start operating</span>
              </div>
            </div>

            <div className={styles.connectWalletBoxButton}>
              <ConnectButton type="link-blue" size="sm" sm={{ size: 'md' }}>
                Connect Wallet
              </ConnectButton>
            </div>
          </div>

          {/* How This Works */}
          <p className={styles.dashboardHeader}>How This Works</p>
          <div className={styles.tutorialVideo}>
            <iframe
              src="https://www.youtube-nocookie.com/embed/videoseries?list=PL9BKN1mys69GgMLD_EVkH-S3CKrPFf_ct"
              title="YouTube video player"
              frameBorder="0"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
            ></iframe>
          </div>
        </>
      )}

      {/* Staking Pool */}
      <p className={classNames(styles.dashboardHeader, provider && styles.extraTopSpacing)}>Staking Pool</p>
      <StakingPool />
      <div className={styles.cardsWrapper} data-cy="staking-cards">
        <Card
          header={
            <CardHeader>
              <h5>Balance</h5>
              <div className={styles.cardHeaderButton}>
                <Button type="secondary" size="sm" onClick={() => setOpenModal('deposit')} disabled={!data}>
                  Deposit
                </Button>
              </div>
            </CardHeader>
          }
          content={
            <div className={styles.cardContent}>
              <div>
                <p className={styles.cardContentTitle}>total</p>
                <p className={styles.cardContentValue} data-cy="balance">
                  {tokenBalances ? formatAndRoundApi3(tokenBalances.userTotal) : UNKNOWN_NUMBER}
                </p>
              </div>
              <div>
                <p className={styles.cardContentTitle}>withdrawable</p>
                <p className={styles.cardContentValue} data-cy="withdrawable">
                  {tokenBalances ? formatAndRoundApi3(tokenBalances.withdrawable) : UNKNOWN_NUMBER}
                </p>
              </div>
            </div>
          }
          contentFooter={
            <Button type="secondary-neutral" size="xs" onClick={() => setOpenModal('withdraw')} disabled={!canWithdraw}>
              Withdraw
            </Button>
          }
        />

        <Card
          header={
            <CardHeader>
              <h5>Staking</h5>
              <div className={styles.cardHeaderButton}>
                <Tooltip overlay="You need to deposit API3 tokens before staking">
                  <img src={images.helpOutline} alt="new proposal help" />
                </Tooltip>
                <Button type="secondary" size="sm" onClick={() => setOpenModal('stake')} disabled={!canStake}>
                  Stake
                </Button>
              </div>
            </CardHeader>
          }
          content={
            <div className={styles.cardContent}>
              <div>
                <p className={styles.cardContentTitle}>staked</p>
                <p className={styles.cardContentValue} data-cy="staked">
                  {data ? formatAndRoundApi3(data.userStaked) : UNKNOWN_NUMBER}
                </p>
              </div>
              <div>
                <p className={styles.cardContentTitle}>unstaked</p>
                <p className={styles.cardContentValue} data-cy="unstaked">
                  {data ? formatAndRoundApi3(data.userUnstaked) : UNKNOWN_NUMBER}
                </p>
              </div>
            </div>
          }
          contentFooter={
            !pendingUnstake && (
              <Button
                type="secondary-neutral"
                size="xs"
                onClick={() => setOpenModal('unstake')}
                disabled={!canInitiateUnstake}
              >
                Initiate Unstake
              </Button>
            )
          }
          gradientBorder={!!pendingUnstake}
        >
          {pendingUnstake && (
            <PendingUnstakePanel
              amount={pendingUnstake.tokensAtUnstakeTime}
              canUnstake={pendingUnstake.canUnstake}
              canUnstakeAndWithdraw={pendingUnstake.canUnstakeAndWithdraw}
              unstakeDate={pendingUnstake.unstakeDate}
            />
          )}
        </Card>
      </div>

      {/* Modals */}
      {data && (
        <Modal open={openModal === 'deposit'} onClose={closeModal}>
          <TokenDepositForm allowance={data.allowance} onClose={closeModal} walletBalance={data.userApi3Balance} />
        </Modal>
      )}
      <Modal open={openModal === 'withdraw'} onClose={closeModal}>
        <TokenAmountForm
          title="How many tokens would you like to withdraw?"
          action="Withdraw"
          onConfirm={async (parsedValue: BigNumber) => {
            if (!api3Pool) return;

            const tx = await handleTransactionError(api3Pool.connect(signer!).withdrawRegular(parsedValue));
            if (tx) {
              setChainData('Save withdraw transaction', { transactions: [...transactions, { type: 'withdraw', tx }] });
            }
            closeModal();
          }}
          inputValue={inputValue}
          onChange={setInputValue}
          maxValue={tokenBalances?.withdrawable}
        />
      </Modal>
      <Modal open={openModal === 'stake'} onClose={closeModal}>
        <TokenAmountForm
          title="How many tokens would you like to stake?"
          action="Stake"
          onConfirm={async (parsedValue: BigNumber) => {
            if (!api3Pool) return;

            const tx = await handleTransactionError(api3Pool.connect(signer!).stake(parsedValue));
            if (tx) {
              setChainData('Save stake transaction', { transactions: [...transactions, { type: 'stake', tx }] });
            }
            closeModal();
          }}
          inputValue={inputValue}
          onChange={setInputValue}
          maxValue={data?.userUnstaked}
        />
      </Modal>
      <Modal open={openModal === 'unstake'} onClose={closeModal}>
        <TokenAmountForm
          title="How many tokens would you like to unstake?"
          action="Initiate Unstaking"
          onConfirm={(value) => {
            // NOTE: We are explicitly not closing modal, because it triggers the confirmation modal
            setConfirmUnstakeAmount(value);
            setOpenModal('confirm-unstake');
          }}
          inputValue={inputValue}
          onChange={setInputValue}
          maxValue={data?.userStaked}
        />
      </Modal>
      <Modal open={openModal === 'confirm-unstake'} onClose={closeModal}>
        {confirmUnstakeAmount && (
          <ConfirmUnstakeForm
            title={`Are you sure you would like to unstake ${inputValue} tokens?`}
            onConfirm={async (parsedValue: BigNumber) => {
              if (!api3Pool || !data) return;

              const tx = await handleTransactionError(api3Pool.connect(signer!).scheduleUnstake(parsedValue));
              if (tx) {
                setChainData('Save initiate unstake transaction', {
                  transactions: [...transactions, { type: 'initiate-unstake', tx }],
                });
              }
              closeModal();
            }}
            amount={confirmUnstakeAmount}
            onClose={closeModal}
          />
        )}
      </Modal>
    </Layout>
  );
};

export default Dashboard;
