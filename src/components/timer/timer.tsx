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

  return (
    <div className={classNames(styles.timer, { [styles.large]: size === 'large' })}>
      <div className={classNames(styles.timerContainer, { [styles.large]: size === 'large' })}>
        <div className={classNames(styles.timerWrap, { [styles.large]: size === 'large' })}>
          <div className={classNames(styles.timerNumber, { [styles.large]: size === 'large' })}>{timerDays}</div>
          <div className={globalStyles.tertiaryColor}>D</div>
        </div>
        <div className={classNames(styles.timerColon, { [styles.large]: size === 'large' })}>:</div>
        <div className={classNames(styles.timerWrap, { [styles.large]: size === 'large' })}>
          <div className={classNames(styles.timerNumber, { [styles.large]: size === 'large' })}>{timerHours}</div>
          <div className={globalStyles.tertiaryColor}>HR</div>
        </div>
        <div className={classNames(styles.timerColon, { [styles.large]: size === 'large' })}>:</div>
        <div className={classNames(styles.timerWrap, { [styles.large]: size === 'large' })}>
          <div className={classNames(styles.timerNumber, { [styles.large]: size === 'large' })}>{timerMinutes}</div>
          <div className={globalStyles.tertiaryColor}>MIN</div>
        </div>
        {size === 'large' && (
          <>
            <div className={classNames(styles.timerColon, { [styles.large]: size === 'large' })}>:</div>
            <div className={classNames(styles.timerWrap, { [styles.large]: size === 'large' })}>
              <div className={classNames(styles.timerNumber, { [styles.large]: size === 'large' })}>{timerSeconds}</div>
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
