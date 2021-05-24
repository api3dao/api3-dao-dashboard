// Adapted from: https://github.com/then/is-promise
export const isPromise = (obj: any) => {
  return !!obj && (typeof obj === 'object' || typeof obj === 'function') && typeof obj.then === 'function';
};

type GoResult<T> = [Error, null] | [null, T | void];

const successFn = <T>(value: T): [null, T] => [null, value];
const errorFn = (err: Error): [Error, null] => [err, null];

export const goSync = <T>(fn: () => T): GoResult<T> => {
  try {
    return successFn(fn());
  } catch (err) {
    return errorFn(err);
  }
};

type PromiseOrFn<T> = Promise<T> | (() => Promise<T>);

export const go = async <T>(fn: PromiseOrFn<T>): Promise<GoResult<T>> => {
  if (typeof fn === 'function') {
    try {
      const res = fn();
      if (isPromise(res)) {
        const promiseRes = await (res as Promise<T>);
        return successFn(promiseRes);
      }
      return successFn((res as any) || null);
    } catch (err) {
      return errorFn(err);
    }
  }

  return fn.then(successFn).catch(errorFn);
};
