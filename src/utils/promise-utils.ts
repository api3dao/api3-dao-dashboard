type GoResult<T> = [Error, null] | [null, T | void];

export const go = async <T>(fn: () => void | Promise<T>): Promise<GoResult<T>> => {
  try {
    const value = await fn();
    return [null, value];
  } catch (err) {
    return [err, null];
  }
};
