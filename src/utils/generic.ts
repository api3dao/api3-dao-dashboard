import { BigNumber } from '@ethersproject/bignumber';

export const blockTimestampToDate = (timestamp: BigNumber) => new Date(timestamp.mul(1000).toNumber());

type GoResult<T> = [Error, null] | [null, T];

export const go = <T>(fn: Promise<T> | (() => Promise<T>)): Promise<GoResult<T>> => {
  function successFn(value: T): [null, T] {
    return [null, value];
  }
  function errorFn(err: Error): [Error, null] {
    return [err, null];
  }
  if (typeof fn === 'function') {
    return fn().then(successFn).catch(errorFn);
  }
  return fn.then(successFn).catch(errorFn);
};  

export const getDays = (distance: number) => {
  const days = Math.floor(distance / (1000 * 60 * 60 * 24)).toString();

  return days;
};

export const getHours = (distance: number) => {
  const hours = Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)).toString();

  return hours;
};

export const getMinutes = (distance: number) => {
  const minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60)).toString();

  return minutes;
};

export const getSeconds = (distance: number) => {
  const seconds = Math.floor((distance % (1000 * 60)) / 1000).toString();

  return seconds;
};
