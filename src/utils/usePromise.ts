import { useState, useEffect, useCallback } from 'react';

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
