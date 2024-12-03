import { useApi3Pool } from '../../../contracts';
import { useChainData } from '../../../chain-data';
import Button from '../../../components/button';
import styles from './unstake-banner.module.scss';
import { handleTransactionError } from '../../../utils';
import { CheckCircleFillIcon } from '../../../components/icons';

interface Props {
  canUnstakeAndWithdraw: boolean;
}

const UnstakeBanner = (props: Props) => {
  const { canUnstakeAndWithdraw } = props;
  const api3Pool = useApi3Pool();
  const { signer, setChainData, transactions, userAccount } = useChainData();

  const handleUnstake = async () => {
    if (!api3Pool) return;
    const tx = await handleTransactionError(api3Pool.connect(signer!).unstake(userAccount));
    if (tx) {
      setChainData('Save unstake transaction', { transactions: [...transactions, { type: 'unstake', tx }] });
    }
  };

  const handleUnstakeAndWithdraw = async () => {
    if (!api3Pool) return;
    const tx = await handleTransactionError(api3Pool.connect(signer!).unstakeAndWithdraw());
    if (tx) {
      setChainData('Save unstake and Withdraw transaction', {
        transactions: [...transactions, { type: 'unstake-withdraw', tx }],
      });
    }
  };

  return (
    <div className={styles.unstakeBanner}>
      <div className={styles.unstakeBannerWrap}>
        <CheckCircleFillIcon />
        <div>Your tokens are ready to be unstaked.</div>
      </div>
      <div className={styles.buttonPanel}>
        <Button type="link-gray" size="sm" md={{ size: 'md' }} onClick={handleUnstake}>
          Unstake
        </Button>
        <Button
          type="link-blue"
          size="sm"
          md={{ size: 'md' }}
          onClick={handleUnstakeAndWithdraw}
          disabled={!canUnstakeAndWithdraw}
        >
          Unstake and Withdraw
        </Button>
      </div>
    </div>
  );
};

export default UnstakeBanner;
