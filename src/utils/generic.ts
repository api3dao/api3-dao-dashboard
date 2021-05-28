import { BigNumber } from '@ethersproject/bignumber';

export const blockTimestampToDate = (timestamp: BigNumber) => new Date(timestamp.mul(1000).toNumber());

export type GoResultSuccess<T> = [null, T];
export type GoResultError = [Error, null];
export type GoResult<T> = GoResultSuccess<T> | GoResultError;
export const GO_ERROR_INDEX = 0;
export const GO_RESULT_INDEX = 1;

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

export const isGoSuccess = <T>(result: GoResult<T>): result is GoResultSuccess<T> => !result[GO_ERROR_INDEX];

export const rethrowError = (error: Error) => {
  throw error;
};

// NOTE: This needs to be written using 'function' syntax (cannot be arrow function)
// See: https://github.com/microsoft/TypeScript/issues/34523#issuecomment-542978853
export function assertGoSuccess<T>(result: GoResult<T>, onError = rethrowError): asserts result is GoResultSuccess<T> {
  if (result[0]) {
    onError(result[0]);
  }
}

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
