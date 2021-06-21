import { BigNumber } from 'ethers';

export const blockTimestampToDate = (timestamp: BigNumber) => new Date(timestamp.mul(1000).toNumber());

type ErrorWithCode = Error & { code?: number };

// The Error object was extended to add a "code" for Web3 providers
// See: https://github.com/ethereum/EIPs/blob/master/EIPS/eip-1193.md#provider-errors
export const isUserRejection = (err: ErrorWithCode) => err.code === 4001 || err.code === 4100;

export type GoResultSuccess<T> = [null, T];
export type GoResultError = [Error, null];
export type GoResult<T> = GoResultSuccess<T> | GoResultError;
export const GO_ERROR_INDEX = 0;
export const GO_RESULT_INDEX = 1;

const successFn = <T>(value: T): [null, T] => [null, value];
const errorFn = (err: Error): [Error, null] => [err, null];

export const goSync = <T>(fn: () => T): GoResult<T> => {
  try {
    return successFn(fn());
  } catch (err) {
    return errorFn(err);
  }
};

export const go = <T>(fn: Promise<T> | (() => Promise<T>)): Promise<GoResult<T>> => {
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

const ONE_MINUTE_AS_MS = 1000 * 60;
const ONE_HOUR_AS_MS = ONE_MINUTE_AS_MS * 60;
const ONE_DAY_AS_MS = ONE_HOUR_AS_MS * 24;

export const getDays = (distance: number) => {
  return Math.floor(distance / ONE_DAY_AS_MS)
    .toString()
    .padStart(2, '0');
};

export const getHours = (distance: number) => {
  return Math.floor((distance % ONE_DAY_AS_MS) / ONE_HOUR_AS_MS)
    .toString()
    .padStart(2, '0');
};

export const getMinutes = (distance: number) => {
  return Math.floor((distance % ONE_HOUR_AS_MS) / ONE_MINUTE_AS_MS)
    .toString()
    .padStart(2, '0');
};

export const getSeconds = (distance: number) => {
  return Math.floor((distance % ONE_MINUTE_AS_MS) / 1000)
    .toString()
    .padStart(2, '0');
};

// If the user is not logged in, we want to display dash in the number fields
export const UNKNOWN_NUMBER = '-';

export const filterAlphanumerical = (value: string) => value.replace(/[^0-9a-zA-Z]/g, '');
