import { useState, useEffect, useRef } from 'react';
import classNames from 'classnames';
import { getDays, getHours, getMinutes, getSeconds } from '../../utils/generic';
import globalStyles from '../../styles/global-styles.module.scss';
import styles from './timer.module.scss';
import { format } from 'date-fns';
import { usePrevious } from '../../utils';

interface Props {
  deadline: Date;
  size?: 'normal' | 'large';
  showDeadline?: boolean;
  onDeadlineExceeded?: () => void;
}

export const DATE_FORMAT = 'do MMMM yyyy';

export const formatDeadline = (deadline: Date) => format(deadline, DATE_FORMAT);

const Timer = (props: Props) => {
  const { deadline, size = 'normal', showDeadline, onDeadlineExceeded } = props;
  const [timerDays, setTimerDays] = useState('00');
  const [timerHours, setTimerHours] = useState('00');
  const [timerMinutes, setTimerMinutes] = useState('00');
  const [timerSeconds, setTimerSeconds] = useState('00');
  const [dateDiff, setDateDiff] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      const now = new Date().getTime();
      const deadlineDate = deadline.getTime();

      let distance = deadlineDate - now;

      if (distance < 0) {
        clearInterval(timer);
        distance = 0;
      }

      const days = getDays(distance);
      const hours = getHours(distance);
      const minutes = getMinutes(distance);
      const seconds = getSeconds(distance);

      setTimerDays(days);
      setTimerHours(hours);
      setTimerMinutes(minutes);
      setTimerSeconds(seconds);
      setDateDiff(distance);
    }, 1000);

    return () => {
      clearInterval(timer);
    };
  }, [deadline]);

  const callbackRef = useRef(onDeadlineExceeded);
  useEffect(() => {
    callbackRef.current = onDeadlineExceeded;
  });

  const previousDateDiff = usePrevious(dateDiff) || 0;
  useEffect(() => {
    // We trigger the callback when we have gone past the deadline (i.e. from a positive diff to a zero diff)
    if (previousDateDiff > 0 && dateDiff === 0) {
      callbackRef.current && callbackRef.current();
    }
  }, [previousDateDiff, dateDiff]);

  const largeSize = size === 'large' ? `${styles.large}` : '';
  const status = dateDiff > 0 ? `Remaining${showDeadline ? '' : ':'}` : 'Ended';
  const formattedDeadline = `${dateDiff > 0 ? 'Ends on' : ''} ${formatDeadline(deadline)}`;

  return (
    <div className={classNames(styles.timer, largeSize, dateDiff === 0 ? styles.grayOut : globalStyles.primaryColor)}>
      <div className={globalStyles.tertiaryColor}>{status}</div>
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
      {showDeadline && <div className={globalStyles.tertiaryColor}>{formattedDeadline}</div>}
    </div>
  );
};

export default Timer;
