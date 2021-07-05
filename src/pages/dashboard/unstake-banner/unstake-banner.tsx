import { useApi3Pool } from '../../../contracts';
import { useChainData } from '../../../chain-data';
import { images } from '../../../utils';
import Button from '../../../components/button/button';
import globalStyles from '../../../styles/global-styles.module.scss';
import styles from './unstake-banner.module.scss';
import { handleTransactionError } from '../../../utils';

interface Props {
  canUnstakeAndWithdraw: boolean;
}

const UnstakeBanner = (props: Props) => {
  const { canUnstakeAndWithdraw } = props;
  const api3Pool = useApi3Pool();
  const { setChainData, transactions, userAccount } = useChainData();

  const handleUnstake = async () => {
    if (!api3Pool) return;
    const tx = await handleTransactionError(api3Pool.unstake(userAccount));
    if (tx) {
      setChainData('Save unstake transaction', { transactions: [...transactions, { type: 'unstake', tx }] });
    }
  };

  const handleUnstakeAndWithdraw = async () => {
    if (!api3Pool) return;
    const [err, tx] = await go(api3Pool.unstakeAndWithdraw());
    if (err) {
      if (isUserRejection(err!)) {
        notifications.info({ message: messages.TX_GENERIC_REJECTED });
        return;
      }
      notifications.error({ message: messages.TX_GENERIC_ERROR, errorOrMessage: err });
      return;
    }
    if (tx) {
      setChainData('Save unstake and Withdraw transaction', {
        transactions: [...transactions, { type: 'unstake-withdraw', tx }],
      });
    }
  };

  return (
    <div className={styles.unstakeBanner}>
      <div className={styles.unstakeBannerWrap}>
        <img src={images.apiIcon} alt="API icon" />
        <div>
          <p className={globalStyles.bold}>Your tokens are ready to be unstaked.</p>
        </div>
      </div>
      <div className={styles.buttonPanel}>
        <Button type="link" onClick={handleUnstake}>
          Unstake
        </Button>
        <Button onClick={handleUnstakeAndWithdraw} disabled={!canUnstakeAndWithdraw}>
          Unstake and Withdraw
        </Button>
      </div>
    </div>
  );
};

export default UnstakeBanner;
