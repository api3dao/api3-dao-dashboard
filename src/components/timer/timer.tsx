import { useState, useEffect } from 'react';
import classNames from 'classnames';
import { getDays, getHours, getMinutes, getSeconds } from '../../utils/generic';
import globalStyles from '../../styles/global-styles.module.scss';
import styles from './timer.module.scss';

interface Props {
  start: Date;
  deadline: Date;
  size?: 'normal' | 'large';
}

const Timer = (props: Props) => {
  const { start, deadline, size = 'normal' } = props;
  const [timerDays, setTimerDays] = useState('0');
  const [timerHours, setTimerHours] = useState('00');
  const [timerMinutes, setTimerMinutes] = useState('00');
  const [timerSeconds, setTimerSeconds] = useState('00');

  useEffect(() => {
    const timer = setInterval(() => {
      const now = new Date().getTime();
      const deadlineDate = deadline.getTime();
      const startDate = start.getTime();

      const distance = deadlineDate - now;

      const days = getDays(distance);
      const hours = getHours(distance);
      const minutes = getMinutes(distance);
      const seconds = getSeconds(distance);

      setTimerDays(days);
      setTimerHours(hours);
      setTimerMinutes(minutes);
      setTimerSeconds(seconds);

      if (deadlineDate < now || startDate > now) {
        clearInterval(timer);
      }
    }, 1000);
    return () => {
      clearInterval(timer);
    };
  }, [deadline, start]);

  const largeSize = size === 'large' ? `${styles.large}` : '';

  return (
    <div className={classNames(styles.timer, largeSize)}>
      <div className={styles.timerContainer}>
        <div className={styles.timerWrap}>
          <div className={styles.timerNumber}>{timerDays}</div>
          <div className={globalStyles.tertiaryColor}>D</div>
        </div>
        <div className={styles.timerColon}>:</div>
        <div className={styles.timerWrap}>
          <div className={styles.timerNumber}>{timerHours}</div>
          <div className={globalStyles.tertiaryColor}>HR</div>
        </div>
        <div className={styles.timerColon}>:</div>
        <div className={styles.timerWrap}>
          <div className={styles.timerNumber}>{timerMinutes}</div>
          <div className={globalStyles.tertiaryColor}>MIN</div>
        </div>
        {size === 'large' && (
          <>
            <div className={styles.timerColon}>:</div>
            <div className={styles.timerWrap}>
              <div className={styles.timerNumber}>{timerSeconds}</div>
              <div className={globalStyles.tertiaryColor}>SEC</div>
            </div>
          </>
        )}
      </div>
      <div className={globalStyles.primaryColor}>remaining</div>
    </div>
  );
};

export default Timer;
