import { BigNumber } from 'ethers';
import { useState, useEffect } from 'react';
import classNames from 'classnames';
import BorderedBox, { Header } from '../../../components/bordered-box/bordered-box';
import Button from '../../../components/button/button';
import { useApi3Pool } from '../../../contracts';
import { useChainData } from '../../../chain-data';
import { formatAndRoundApi3, getDays, getHours, getMinutes, getSeconds } from '../../../utils';
import globalStyles from '../../../styles/global-styles.module.scss';
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
  const { transactions, setChainData, userAccount } = useChainData();

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
    const tx = await handleTransactionError(api3Pool.unstake(userAccount));
    if (tx) {
      setChainData('Save unstake transaction', { transactions: [...transactions, { type: 'unstake', tx }] });
    }
  };

  const handleUnstakeAndWithdraw = async () => {
    if (!api3Pool) return;
    const tx = await handleTransactionError(api3Pool.unstakeAndWithdraw());
    if (tx) {
      setChainData('Save unstake and Withdraw transaction', {
        transactions: [...transactions, { type: 'unstake-withdraw', tx }],
      });
    }
  };

  return (
    <BorderedBox
      header={
        <Header alignCenter>
          <p className={styles.pendingUnstakeTitle}>Pending API3 tokens unstaking</p>
        </Header>
      }
      content={
        <div className={styles.pendingUnstakeContent} data-cy="pending-unstake">
          <div className={classNames(styles.pendingUnstakeRow, styles.amount)}>
            <p className={styles.pendingUnstakeName}>Amount</p>
            <h5 data-cy="amount">{formatAndRoundApi3(amount)}</h5>
          </div>
          <div className={classNames(styles.pendingUnstakeRow, { [globalStyles.tertiaryColor]: canUnstake })}>
            <p className={styles.pendingUnstakeName}>Cooldown</p>
            <div className={styles.pendingUnstakeCountdown}>
              <div className={styles.pendingUnstakeCountdownItem}>
                <p className={`${globalStyles.textSmall} ${globalStyles.medium}`}>{timerDays}</p>
                <p className={styles.shortcut}>D</p>
              </div>
              <div className={styles.colon}>:</div>
              <div className={styles.pendingUnstakeCountdownItem}>
                <p className={`${globalStyles.textSmall} ${globalStyles.medium}`}>{timerHours}</p>
                <p className={styles.shortcut}>HR</p>
              </div>
              <div className={styles.colon}>:</div>
              <div className={styles.pendingUnstakeCountdownItem}>
                <p className={`${globalStyles.textSmall} ${globalStyles.medium}`}>{timerMinutes}</p>
                <p className={styles.shortcut}>MIN</p>
              </div>
              <div className={styles.colon}>:</div>
              <div className={styles.pendingUnstakeCountdownItem}>
                <p className={`${globalStyles.textSmall} ${globalStyles.medium}`}>{timerSeconds}</p>
                <p className={styles.shortcut}>SEC</p>
              </div>
            </div>
          </div>
          <div className={styles.pendingUnstakeActions}>
            <Button type="link" onClick={handleUnstake} disabled={!canUnstake}>
              Unstake
            </Button>
            <Button onClick={handleUnstakeAndWithdraw} disabled={!canUnstakeAndWithdraw}>
              Unstake and Withdraw
            </Button>
          </div>
        </div>
      }
      borderColor="green"
      borderBottom
    />
  );
};

export default PendingUnstakePanel;
