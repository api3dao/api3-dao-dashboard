import { BigNumber } from 'ethers';
import { useState, useEffect } from 'react';
import classNames from 'classnames';
import BorderedBox from '../../../components/bordered-box/bordered-box';
import Button from '../../../components/button/button';
import { getDays, getHours, getMinutes, getSeconds } from '../../../utils/generic';
import './pending-unstake-panel.scss';

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
  const [timerDeadline, setTimerDeadline] = useState('You have 0 days 0 hours 0 min 0 sec remaining to unstake.');

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
        // TODO: This will be incorrect for singular, e.g. 1 days
        setTimerDeadline(`You have ${days} days ${hours} hours ${minutes} min ${seconds} sec remaining to unstake.`);
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
        <div className="bordered-box-header _alignCenter">
          <img src="/arrow-down.svg" alt="arrow down" />
        </div>
      }
      content={
        <div className="pending-unstake-content">
          <p className="pending-unstake-title text-small medium green-color text-center">
            Pending API3 tokens unstaking
          </p>
          <div className="pending-unstake-row _amount">
            <p className="pending-unstake-name text-small medium">Amount</p>
            <h5>{amount}</h5>
          </div>
          <div className={classNames('pending-unstake-row', { [`tertiary-color`]: isUnstakeReady })}>
            <p className="pending-unstake-name text-small medium">Cooldown</p>
            <div className="pending-unstake-countdown">
              <div className="pending-unstake-countdown-item">
                <p className="text-small medium">{timerDays}</p>
                <p className="tertiary-color text-xsmall medium">D</p>
              </div>
              <div className="colon text-small medium">:</div>
              <div className="pending-unstake-countdown-item">
                <p className="text-small medium">{timerHours}</p>
                <p className="tertiary-color text-xsmall medium">HR</p>
              </div>
              <div className="colon text-small medium">:</div>
              <div className="pending-unstake-countdown-item">
                <p className="text-small medium">{timerMinutes}</p>
                <p className="tertiary-color text-xsmall medium">MIN</p>
              </div>
              <div className="colon text-small medium">:</div>
              <div className="pending-unstake-countdown-item">
                <p className="text-small medium">{timerSeconds}</p>
                <p className="tertiary-color text-xsmall medium">SEC</p>
              </div>
            </div>
          </div>
          {isUnstakeReady && (
            <div className="pending-unstake-row _deadline">
              <p className="pending-unstake-name" />
              <p className="text-xsmall">{timerDeadline}</p>
            </div>
          )}
          <div className="pending-unstake-actions">
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
