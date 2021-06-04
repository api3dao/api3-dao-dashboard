import { useState, useEffect } from 'react';
import classNames from 'classnames';
import BorderedBox, { Header } from '../../../components/bordered-box/bordered-box';
import Button from '../../../components/button/button';
import { getDays, getHours, getMinutes, getSeconds } from '../../../utils/generic';
import globalStyles from '../../../styles/global-styles.module.scss';
import styles from './pending-unstake-panel.module.scss';

interface Props {
  amount: string;
  scheduledFor: Date;
  deadline: Date;
}

const PendingUnstakePanel = (props: Props) => {
  const { amount, scheduledFor, deadline } = props;
  const [isDeadline, setDeadline] = useState(false);
  const [timerDays, setTimerDays] = useState('0');
  const [timerHours, setTimerHours] = useState('00');
  const [timerMinutes, setTimerMinutes] = useState('00');
  const [timerSeconds, setTimerSeconds] = useState('00');
  const [timerDeadline, setTimerDeadline] = useState('You have 0 days 0 hours 0 min 0 sec remaining to unstake.');

  useEffect(() => {
    const deadlineDate = deadline.getTime();
    const timer = setInterval(() => {
      const now = new Date().getTime();
      const scheduledDate = scheduledFor.getTime();
      let distance;

      if (scheduledDate > now) {
        distance = scheduledDate - now;
      } else {
        distance = deadlineDate - now;
      }

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
        setTimerDeadline(`You have ${days} days ${hours} hours ${minutes} min ${seconds} sec remaining to unstake.`);
        setDeadline(true);
      }

      if (deadlineDate < now) {
        clearInterval(timer);
        // TODO: This will be incorrect for singular, e.g. 1 days
        setTimerDeadline(`You have 0 days 0 hours 0 min 0 sec remaining to unstake.`);
      }
    }, 1000);
    return () => {
      clearInterval(timer);
    };
  }, [deadline, scheduledFor]);

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
            <h5>{amount}</h5>
          </div>
          <div className={classNames(styles.pendingUnstakeRow, { [globalStyles.tertiaryColor]: isDeadline })}>
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
          {isDeadline && (
            <div className={classNames(styles.pendingUnstakeRow, styles.deadline)}>
              <p className={styles.pendingUnstakeName} />
              <p className={globalStyles.textXSmall}>{timerDeadline}</p>
            </div>
          )}
          <div className={styles.pendingUnstakeActions}>
            <Button type="link" disabled={!isDeadline}>
              Unstake & Withdraw
            </Button>
            <Button disabled={!isDeadline}>Unstake</Button>
          </div>
        </div>
      }
      borderColor="green"
      borderBottom
    />
  );
};

export default PendingUnstakePanel;
