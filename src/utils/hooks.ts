import { useEffect, useMemo, useReducer, useRef } from 'react';
import { useLocation } from 'react-router';
import isEqual from 'lodash/isEqual';

// Allows access to the previous to the previous value when re-rendering
// https://reactjs.org/docs/hooks-faq.html#how-to-get-the-previous-props-or-state
export const usePrevious = <T>(value: T) => {
  const ref = useRef<T>();

  useEffect(() => {
    ref.current = value;
  }, [value]);

  // Return previous value (happens before update in useEffect above)
  return ref.current;
};

// NOTE: Try to avoid this hook if possible.
// https://reactjs.org/docs/hooks-faq.html#is-there-something-like-forceupdate
export const useForceUpdate = () => {
  const [, forceUpdate] = useReducer((x) => x + 1, 0);
  return forceUpdate;
};

export const useOnMountEffect = (fn: () => void) => {
  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(fn, []);
};

export const useIsMount = () => {
  const isMountRef = useRef(true);
  useEffect(() => {
    isMountRef.current = false;
  }, []);
  return isMountRef.current;
};

// https://reactrouter.com/web/example/query-parameters
export const useQueryParams = () => {
  return new URLSearchParams(useLocation().search);
};

export const useScrollToTop = () => {
  const { pathname } = useLocation();
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);
};

export function useStableIds<T, Id>(data: T[], idMapperFn: (entry: T) => Id) {
  const stableIdsRef = useRef<Id[]>();

  const stableIds = useMemo(() => {
    const ids = data.map(idMapperFn);
    if (!stableIdsRef.current) {
      return ids;
    }

    return isEqual(stableIdsRef.current, ids) ? stableIdsRef.current : ids;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [data]);

  useEffect(() => {
    stableIdsRef.current = stableIds;
  });

  return stableIds;
}
