import classNames from 'classnames';
import { useCountdown } from './hooks';
import globalStyles from '../../styles/global-styles.module.scss';
import styles from './timer.module.scss';
import { format } from 'date-fns';

interface Props {
  deadline: Date;
  size?: 'normal' | 'large';
  showDeadline?: boolean;
  onDeadlineExceeded?: () => void;
}

export const DATE_FORMAT = 'do MMMM yyyy';

export const formatDeadline = (deadline: Date) => format(deadline, DATE_FORMAT);

const Timer = (props: Props) => {
  const { deadline, size = 'normal', showDeadline } = props;
  const countdown = useCountdown(deadline, props.onDeadlineExceeded);

  const { dateDiff } = countdown;

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
