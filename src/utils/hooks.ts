import { useEffect, useRef } from 'react';

// Allows access to the previous to the previous value when re-rendering
// https://reactjs.org/docs/hooks-faq.html#how-to-get-the-previous-props-or-state
export const usePrevious = (value: any) => {
  const ref = useRef();

  useEffect(() => {
    ref.current = value;
  }, [value]);

  // Return previous value (happens before update in useEffect above)
  return ref.current;
};
