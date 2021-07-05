import { useChainData } from '../../chain-data';
import Button from '../../components/button/button';
import Layout from '../../components/layout/layout';
import { useApi3Pool, useTimelockManager } from '../../contracts';
import { useLoadVestingData } from '../../logic/vesting/hooks';
import { handleTransactionError } from '../../utils';
import styles from './vesting.module.scss';

const Vesting = () => {
  const { userAccount, setChainData, vesting } = useChainData();
  const timelockManager = useTimelockManager();
  const api3Pool = useApi3Pool();

  useLoadVestingData();

  const canUpdateTimelockStatus = vesting?.amountVested.gt(0) ?? false;
  const canWithdrawToPool = vesting?.remainingToWithdraw.gt(0) ?? false;

  return (
    <Layout title="Vesting">
      <div className={styles.wrapper}>
        <Button
          onClick={async () => {
            if (!api3Pool || !userAccount) return;

            const tx = await handleTransactionError(api3Pool.updateTimelockStatus(userAccount));
            if (tx) {
              setChainData('Save update timelock status transaction', (state) => ({
                transactions: [...state.transactions, { type: 'update-timelock-status', tx }],
              }));
            }
          }}
          disabled={!canUpdateTimelockStatus}
        >
          Update timelock status
        </Button>
        <Button
          onClick={async () => {
            if (!timelockManager || !api3Pool) return;

            const tx = await handleTransactionError(timelockManager.withdrawToPool(api3Pool.address, userAccount));
            if (tx) {
              setChainData('Save withdraw to pool transaction', (state) => ({
                transactions: [...state.transactions, { type: 'withdraw-to-pool', tx }],
              }));
            }
          }}
          disabled={!canWithdrawToPool}
        >
          Withdraw to pool
        </Button>
      </div>
    </Layout>
  );
};

export default Vesting;
