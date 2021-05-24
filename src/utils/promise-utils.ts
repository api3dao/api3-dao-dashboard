// Adapted from: https://github.com/then/is-promise
export const isPromise = (obj: any) => {
  return !!obj && (typeof obj === 'object' || typeof obj === 'function') && typeof obj.then === 'function';
};

type PromiseOrFn<T> = Promise<T> | (() => any);
type GoResult<T> = [Error, null] | [null, T | void];

export const go = async <T>(fn: PromiseOrFn<T>): Promise<GoResult<T>> => {
  function successFn(value: T): [null, T] {
    return [null, value];
  }
  function errorFn(err: Error): [Error, null] {
    return [err, null];
  }

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
