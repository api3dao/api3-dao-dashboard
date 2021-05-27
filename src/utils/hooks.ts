import { useEffect, useRef } from 'react';
import { useChainData } from '../chain-data';

/**
 * Use this to bypass eslint rule checking if all hook dependencies are used.
 * You might want to execute your hook on some value not directly
 * used in code (e.g. blockNumber)
 *
 * This function is noop, and will be removed from production bundle.
 */
// TODO: verify that it is eliminated from production bundle
export const unusedHookDependency = (..._args: any[]) => {};

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

export const useOnAccountOrNetworkChange = (callback: () => any) => {
  const { networkName, userAccount } = useChainData();
  const prevUserAccount = usePrevious(userAccount);
  const prevNetworkName = usePrevious(networkName);

  useEffect(() => {
    // It's possible for the user to have a "permissioned" modal open while on one account,
    // then switch to another network or account that does not have the same permissions.
    // As a blanket fix, close any open modals when the selected account changes.
    if (prevUserAccount !== userAccount || prevNetworkName !== networkName) {
      callback();
    }
  }, [prevUserAccount, userAccount, prevNetworkName, networkName, callback]);
};
