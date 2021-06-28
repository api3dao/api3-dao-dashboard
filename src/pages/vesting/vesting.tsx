import { useChainData } from '../../chain-data';
import Button from '../../components/button/button';
import Layout from '../../components/layout/layout';
import { notifications } from '../../components/notifications/notifications';
import { useApi3Pool, useTimelockManager } from '../../contracts';
import { useLoadVestingData } from '../../logic/vesting/hooks';
import { go, GO_ERROR_INDEX, GO_RESULT_INDEX, isGoSuccess, isUserRejection, messages } from '../../utils';
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

            const goResponse = await go(api3Pool.updateTimelockStatus(userAccount));
            // TODO: Maybe create a helper function for this error handling
            if (isGoSuccess(goResponse)) {
              const tx = goResponse[GO_RESULT_INDEX];
              setChainData('Save update timelock status transaction', (state) => ({
                transactions: [...state.transactions, { type: 'update-timelock-status', tx }],
              }));
            } else {
              if (isUserRejection(goResponse[GO_ERROR_INDEX])) {
                notifications.info({ message: messages.TX_GENERIC_REJECTED });
                return;
              }
              notifications.error({ message: messages.TX_GENERIC_ERROR, errorOrMessage: goResponse[GO_ERROR_INDEX] });
              return;
            }
          }}
          disabled={!canUpdateTimelockStatus}
        >
          Update timelock status
        </Button>
        <Button
          onClick={async () => {
            if (!timelockManager || !api3Pool) return;

            const goResponse = await go(timelockManager.withdrawToPool(api3Pool.address, userAccount));
            if (isGoSuccess(goResponse)) {
              const tx = goResponse[GO_RESULT_INDEX];
              setChainData('Save withdraw to pool transaction', (state) => ({
                transactions: [...state.transactions, { type: 'withdraw-to-pool', tx }],
              }));
            } else {
              if (isUserRejection(goResponse[GO_ERROR_INDEX])) {
                notifications.info({ message: messages.TX_GENERIC_REJECTED });
                return;
              }
              notifications.error({ message: messages.TX_GENERIC_ERROR, errorOrMessage: goResponse[GO_ERROR_INDEX] });
              return;
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
