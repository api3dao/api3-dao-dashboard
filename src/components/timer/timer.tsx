import { useState, useEffect } from 'react';
import classNames from 'classnames';
import { getDays, getHours, getMinutes, getSeconds } from '../../utils/generic';
import './timer.scss';

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
    <div className={classNames('timer medium', { [`_large`]: size === 'large' })}>
      <div className="timer-container">
        <div className="timer-wrap">
          <div className="timer-number primary-color">{timerDays}</div>
          <div className="tertiary-color">D</div>
        </div>
        <div className="timer-colon primary-color">:</div>
        <div className="timer-wrap">
          <div className="timer-number primary-color">{timerHours}</div>
          <div className="tertiary-color">HR</div>
        </div>
        <div className="timer-colon primary-color">:</div>
        <div className="timer-wrap">
          <div className="timer-number primary-color">{timerMinutes}</div>
          <div className="tertiary-color">MIN</div>
        </div>
        {size === 'large' && (
          <>
            <div className="timer-colon primary-color">:</div>
            <div className="timer-wrap">
              <div className="timer-number primary-color">{timerSeconds}</div>
              <div className="tertiary-color">SEC</div>
            </div>
          </>
        )}
      </div>
      <div className="primary-color">remaining</div>
    </div>
  );
};

export default Timer;
