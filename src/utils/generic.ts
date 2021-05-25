import { BigNumber, FixedNumber } from 'ethers';

export const blockTimestampToDate = (timestamp: BigNumber) => new Date(timestamp.mul(1000).toNumber());

export const fixedToBigNumber = (fixed: FixedNumber) => BigNumber.from(fixed.round().toString().split('.')[0]);

// The Error object was extended to add a "code" for Web3 providers
// See: https://github.com/ethereum/EIPs/blob/master/EIPS/eip-1193.md#provider-errors
export const isUserRejection = (err: Error) => (err as any).code === 4001 || (err as any).code === 4100;

type GoResult<T> = [Error, null] | [null, T];

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

export const getDays = (distance: number) => {
  return Math.floor(distance / (1000 * 60 * 60 * 24)).toString();
};

export const getHours = (distance: number) => {
  return Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)).toString();
};

export const getMinutes = (distance: number) => {
  return Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60)).toString();
};

export const getSeconds = (distance: number) => {
  return Math.floor((distance % (1000 * 60)) / 1000).toString();
};
