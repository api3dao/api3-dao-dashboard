import { BigNumber } from 'ethers';
import { useState, useEffect } from 'react';
import classNames from 'classnames';
import Button from '../../../components/button';
import { useApi3Pool } from '../../../contracts';
import { useChainData } from '../../../chain-data';
import { formatAndRoundApi3, getDays, getHours, getMinutes, getSeconds } from '../../../utils';
import styles from './pending-unstake-panel.module.scss';
import { handleTransactionError } from '../../../utils';

interface Props {
  amount: BigNumber;
  canUnstake: boolean;
  canUnstakeAndWithdraw: boolean;
  unstakeDate: Date;
}

const PendingUnstakePanel = (props: Props) => {
  const api3Pool = useApi3Pool();
  const { signer, transactions, setChainData, userAccount } = useChainData();

  const { amount, canUnstake, canUnstakeAndWithdraw, unstakeDate } = props;
  const [timerDays, setTimerDays] = useState('0');
  const [timerHours, setTimerHours] = useState('00');
  const [timerMinutes, setTimerMinutes] = useState('00');
  const [timerSeconds, setTimerSeconds] = useState('00');

  useEffect(() => {
    const timer = setInterval(() => {
      const now = new Date().getTime();
      const unstakeTime = unstakeDate.getTime();

      const distance = unstakeTime - now;
      const days = getDays(distance);
      const hours = getHours(distance);
      const minutes = getMinutes(distance);
      const seconds = getSeconds(distance);

      setTimerDays(days);
      setTimerHours(hours);
      setTimerMinutes(minutes);
      setTimerSeconds(seconds);

      if (unstakeTime < now) {
        setTimerDays('0');
        setTimerHours('00');
        setTimerMinutes('00');
        setTimerSeconds('00');

        clearInterval(timer);
      }
    }, 1000);

    return () => {
      clearInterval(timer);
    };
  }, [unstakeDate]);

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
    <div className={styles.pendingUnstakePanel}>
      <p className={styles.pendingUnstakeTitle}>Pending API3 tokens unstaking</p>
      <div className={styles.pendingUnstakeContent} data-cy="pending-unstake">
        <div className={classNames(styles.pendingUnstakeRow, styles.amount)}>
          <p className={styles.pendingUnstakeName}>Amount</p>
          <h5 data-cy="amount">{formatAndRoundApi3(amount)}</h5>
        </div>
        <div className={styles.pendingUnstakeRow}>
          <p className={styles.pendingUnstakeName}>Cooldown</p>
          <div className={styles.pendingUnstakeCountdown}>
            <div className={styles.pendingUnstakeCountdownItem}>
              <p>{timerDays}</p>
              <p className={styles.shortcut}>D</p>
            </div>
            <div className={styles.colon}>:</div>
            <div className={styles.pendingUnstakeCountdownItem}>
              <p>{timerHours}</p>
              <p className={styles.shortcut}>HR</p>
            </div>
            <div className={styles.colon}>:</div>
            <div className={styles.pendingUnstakeCountdownItem}>
              <p>{timerMinutes}</p>
              <p className={styles.shortcut}>MIN</p>
            </div>
            <div className={styles.colon}>:</div>
            <div className={styles.pendingUnstakeCountdownItem}>
              <p>{timerSeconds}</p>
              <p className={styles.shortcut}>SEC</p>
            </div>
          </div>
        </div>
        <div className={styles.pendingUnstakeActions}>
          <Button size="xs" type="secondary-neutral" onClick={handleUnstake} disabled={!canUnstake}>
            Unstake
          </Button>
          <Button size="xs" type="primary" onClick={handleUnstakeAndWithdraw} disabled={!canUnstakeAndWithdraw}>
            Unstake and Withdraw
          </Button>
        </div>
      </div>
    </div>
  );
};

export default PendingUnstakePanel;
