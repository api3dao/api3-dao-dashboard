import { BigNumber } from '@ethersproject/bignumber';

export const blockTimestampToDate = (timestamp: BigNumber) => new Date(timestamp.mul(1000).toNumber());

type GoResult<T> = [Error, null] | [null, T];

export const go = <T>(fn: () => Promise<T>): Promise<GoResult<T>> => {
  function successFn(value: T): [null, T] {
    return [null, value];
  }
  function errorFn(err: Error): [Error, null] {
    return [err, null];
  }
  return fn().then(successFn).catch(errorFn);
};
