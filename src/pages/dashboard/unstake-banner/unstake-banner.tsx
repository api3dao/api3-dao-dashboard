import Button from '../../../components/button/button';
import globalStyles from '../../../styles/global-styles.module.scss';
import styles from './unstake-banner.module.scss';

type Props = {
  onClick?: () => void;
};

const UnstakeBanner = ({ onClick }: Props) => {
  return (
    <div className={styles.unstakeBanner}>
      <div className={styles.unstakeBannerWrap}>
        <img src="/api-icon.svg" alt="api icon" />
        <div>
          <p className={globalStyles.bold}>Your tokens are ready to be unstaked.</p>
        </div>
      </div>
      <Button size="large" onClick={onClick}>
        Unstake
      </Button>
    </div>
  );
};

export default UnstakeBanner;
