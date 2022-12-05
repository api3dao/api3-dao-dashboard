import { useEffect, useRef, useState } from 'react';
import { getDays, getHours, getMinutes, getSeconds, usePrevious } from '../../utils';

interface Countdown {
  days: string;
  hours: string;
  minutes: string;
  seconds: string;
  dateDiff: number;
}

export function useCountdown(deadline: Date, onDeadlineExceeded?: () => void) {
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

  return countdown;
}

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
