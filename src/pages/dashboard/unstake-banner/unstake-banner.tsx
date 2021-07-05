import { useApi3Pool } from '../../../contracts';
import { useChainData } from '../../../chain-data';
import { images } from '../../../utils';
import Button from '../../../components/button/button';
import globalStyles from '../../../styles/global-styles.module.scss';
import styles from './unstake-banner.module.scss';
import { handleTransactionError } from '../../../utils';

const UnstakeBanner = () => {
  const api3Pool = useApi3Pool();
  const { setChainData, transactions, userAccount } = useChainData();

  const handleUnstake = async () => {
    if (!api3Pool) return;
    const tx = await handleTransactionError(api3Pool.unstake(userAccount));
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
