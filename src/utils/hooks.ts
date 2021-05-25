import { useState, useEffect, useCallback, useRef } from 'react';

/**
 * Use this to bypass eslint rule checking if all hook dependencies are used.
 * You might want to execute your hook on some value not directly
 * used in code (e.g. blockNumber)
 *
 * This function is noop, and will be removed from production bundle.
 */
// TODO: verify that it is eliminated from production bundle
export const unusedHookDependency = (..._args: any[]) => {};

// Inspired by https://usehooks.com/useAsync/
// Make sure the asyncFunction is wrapped memoized otherwise there will be
// and infinite loop.

// Intentionally avoiding external dependency to reduce the attack surface
export const usePromise = <T, E = Error>(
  asyncFunction: () => Promise<T>
): [E | null, T | null, 'pending' | 'success' | 'error'] => {
  const [status, setStatus] = useState<'pending' | 'success' | 'error'>('pending');
  const [value, setValue] = useState<T | null>(null);
  const [error, setError] = useState<E | null>(null);

  const execute = useCallback(async () => {
    setStatus('pending');
    setError(null);

    try {
      setValue(await asyncFunction());
      setStatus('success');
    } catch (error) {
      setError(error);
      setStatus('error');
    }
  }, [asyncFunction]);

  useEffect(() => {
    execute();
  }, [execute]);

  // Promise value is returned second to remind developers to handle the error
  return [error, value, status];
};

export const usePrevious = (value: any) => {
  const ref = useRef();

  useEffect(() => {
    ref.current = value;
  }, [value]);

  return ref.current;
};
