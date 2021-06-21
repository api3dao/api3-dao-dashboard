import { useApi3Pool } from '../../../contracts';
import { useChainData } from '../../../chain-data';
import { go, images, isUserRejection, messages } from '../../../utils';
import { notifications } from '../../../components/notifications/notifications';
import Button from '../../../components/button/button';
import globalStyles from '../../../styles/global-styles.module.scss';
import styles from './unstake-banner.module.scss';

const UnstakeBanner = () => {
  const api3Pool = useApi3Pool();
  const { setChainData, transactions, userAccount } = useChainData();

  const handleUnstake = async () => {
    if (!api3Pool) return;
    const [err, tx] = await go(api3Pool.unstake(userAccount));
    if (err) {
      if (isUserRejection(err!)) {
        notifications.info({ message: messages.TX_GENERIC_REJECTED });
        return;
      }
      notifications.error({ message: messages.TX_GENERIC_ERROR });
      return;
    }
    if (tx) {
      setChainData('Save unstake transaction', { transactions: [...transactions, { type: 'unstake', tx }] });
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
      <Button size="large" onClick={handleUnstake}>
        Unstake
      </Button>
    </div>
  );
};

export default UnstakeBanner;
