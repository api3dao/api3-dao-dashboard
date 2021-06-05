import { BigNumber } from 'ethers';
import { useState, useEffect } from 'react';
import classNames from 'classnames';
import BorderedBox, { Header } from '../../../components/bordered-box/bordered-box';
import Button from '../../../components/button/button';
import { formatApi3, getDays, getHours, getMinutes, getSeconds } from '../../../utils';
import globalStyles from '../../../styles/global-styles.module.scss';
import styles from './pending-unstake-panel.module.scss';

interface Props {
  amount: BigNumber;
  scheduledFor: BigNumber;
}

const PendingUnstakePanel = (props: Props) => {
  const { amount, scheduledFor } = props;
  const [isUnstakeReady, setUnstakeReady] = useState(false);
  const [timerDays, setTimerDays] = useState('0');
  const [timerHours, setTimerHours] = useState('00');
  const [timerMinutes, setTimerMinutes] = useState('00');
  const [timerSeconds, setTimerSeconds] = useState('00');

  useEffect(() => {
    const timer = setInterval(() => {
      const now = new Date().getTime();
      const scheduledDate = new Date(scheduledFor.mul(1000).toNumber()).getTime();

      const distance = scheduledDate - now;
      const days = getDays(distance);
      const hours = getHours(distance);
      const minutes = getMinutes(distance);
      const seconds = getSeconds(distance);

      setTimerDays(days);
      setTimerHours(hours);
      setTimerMinutes(minutes);
      setTimerSeconds(seconds);

      if (scheduledDate < now) {
        setTimerDays('0');
        setTimerHours('00');
        setTimerMinutes('00');
        setTimerSeconds('00');
        setUnstakeReady(true);

        clearInterval(timer);
      }
    }, 1000);

    return () => {
      clearInterval(timer);
    };
  }, [scheduledFor]);

  return (
    <BorderedBox
      header={
        <Header alignCenter>
          <img src="/arrow-down.svg" alt="arrow down" />
        </Header>
      }
      content={
        <div className={styles.pendingUnstakeContent}>
          <p className={styles.pendingUnstakeTitle}>Pending API3 tokens unstaking</p>
          <div className={classNames(styles.pendingUnstakeRow, styles.amount)}>
            <p className={styles.pendingUnstakeName}>Amount</p>
            <h5>{formatApi3(amount)}</h5>
          </div>
          <div className={classNames(styles.pendingUnstakeRow, { [globalStyles.tertiaryColor]: isUnstakeReady })}>
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
            <Button type="link" disabled={!isUnstakeReady}>
              Unstake & Withdraw
            </Button>
            <Button disabled={!isUnstakeReady}>Unstake</Button>
          </div>
        </div>
      }
      borderColor="green"
      borderBottom
    />
  );
};

export default PendingUnstakePanel;
