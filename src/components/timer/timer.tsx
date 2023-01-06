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

interface Countdown {
  days: string;
  hours: string;
  minutes: string;
  seconds: string;
  dateDiff: number;
}

const Timer = (props: Props) => {
  const { deadline, size = 'normal', showDeadline, onDeadlineExceeded } = props;
  const [countdown, setCountdown] = useState<Countdown>(() => calculateCountdown(deadline));

  useEffect(() => {
    const timer = setInterval(() => {
      const countdown = calculateCountdown(deadline);
      setCountdown(countdown);

      if (countdown.dateDiff === 0) {
        clearInterval(timer);
      }
    }, 1000);

    return () => {
      clearInterval(timer);
    };
  }, [deadline]);

  const callbackRef = useRef(onDeadlineExceeded);
  useEffect(() => {
    callbackRef.current = onDeadlineExceeded;
  });

  const { dateDiff } = countdown;
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
    <div
      className={classNames(styles.timer, largeSize, dateDiff === 0 ? styles.grayOut : globalStyles.primaryColor)}
      data-testid="timer"
    >
      <div className={globalStyles.tertiaryColor}>{status}</div>
      <div className={styles.timerContainer}>
        <div className={styles.timerWrap}>
          <div className={styles.timerNumber}>{countdown.days}</div>
          <div className={globalStyles.tertiaryColor}>D</div>
        </div>
        <div className={styles.timerColon}>:</div>
        <div className={styles.timerWrap}>
          <div className={styles.timerNumber}>{countdown.hours}</div>
          <div className={globalStyles.tertiaryColor}>HR</div>
        </div>
        <div className={styles.timerColon}>:</div>
        <div className={`visual-test:invisible ${styles.timerWrap}`}>
          <div className={styles.timerNumber}>{countdown.minutes}</div>
          <div className={globalStyles.tertiaryColor}>MIN</div>
        </div>
        {size === 'large' && (
          <>
            <div className={styles.timerColon}>:</div>
            <div className={`visual-test:invisible ${styles.timerWrap}`}>
              <div className={styles.timerNumber}>{countdown.seconds}</div>
              <div className={globalStyles.tertiaryColor}>SEC</div>
            </div>
          </>
        )}
      </div>
      {showDeadline && <div className={`visual-test:invisible ${globalStyles.tertiaryColor}`}>{formattedDeadline}</div>}
    </div>
  );
};

export default Timer;

function calculateCountdown(deadline: Date): Countdown {
  const now = new Date().getTime();
  const dateDiff = Math.max(deadline.getTime() - now, 0);

  return {
    days: getDays(dateDiff),
    hours: getHours(dateDiff),
    minutes: getMinutes(dateDiff),
    seconds: getSeconds(dateDiff),
    dateDiff,
  };
}
