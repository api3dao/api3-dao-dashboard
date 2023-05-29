import { useEffect, useMemo, useRef, useState } from 'react';
import { useAccount } from 'wagmi';
import debounce from 'lodash/debounce';
import { transactionMessages, usePrevious, useIsMount, useOnMountEffect } from '../utils';
import { useChainData, displayPendingTransaction } from '../chain-data';
import {
  Api3Pool__factory as Api3PoolFactory,
  Api3Token__factory as Api3TokenFactory,
  Api3Voting__factory as Api3VotingFactory,
  Convenience__factory as ConvenienceFactory,
  TimelockManager__factory as TimelockManagerFactory,
  ClaimsManager__factory as ClaimsManagerFactory,
  KlerosLiquidProxy__factory as KlerosLiquidProxyFactory,
} from './artifacts/factories';
import { initialChainData } from '../chain-data/state';

export const useApi3Pool = () => {
  const { contracts, signer } = useChainData();

  return useMemo(() => {
    if (!contracts || !signer) return null;
    return Api3PoolFactory.connect(contracts.api3Pool, signer);
  }, [signer, contracts]);
};

export const useApi3Token = () => {
  const { contracts, signer } = useChainData();

  return useMemo(() => {
    if (!contracts || !signer) return null;
    return Api3TokenFactory.connect(contracts.api3Token, signer);
  }, [signer, contracts]);
};

export const useApi3Voting = () => {
  const { contracts, signer } = useChainData();

  return useMemo(() => {
    if (!contracts || !signer) return null;
    return {
      primary: Api3VotingFactory.connect(contracts.votingAppPrimary, signer),
      secondary: Api3VotingFactory.connect(contracts.votingAppSecondary, signer),
    };
  }, [signer, contracts]);
};

export interface Api3Agent {
  primary: string;
  secondary: string;
}

export const useApi3AgentAddresses = (): Api3Agent | null => {
  const { contracts } = useChainData();

  return useMemo(() => {
    if (!contracts) return null;
    return {
      primary: contracts.agentAppPrimary,
      secondary: contracts.agentAppSecondary,
    };
  }, [contracts]);
};

export const useConvenience = () => {
  const { contracts, signer } = useChainData();

  return useMemo(() => {
    if (!contracts || !signer) return null;

    return ConvenienceFactory.connect(contracts.convenience, signer);
  }, [signer, contracts]);
};

export const useTimelockManager = () => {
  const { signer, contracts } = useChainData();

  return useMemo(() => {
    if (!contracts || !signer) return null;

    return TimelockManagerFactory.connect(contracts.timelockManager, signer);
  }, [signer, contracts]);
};

export const useClaimsManager = () => {
  const { signer, contracts } = useChainData();

  return useMemo(() => {
    if (!signer || !contracts) return null;

    return ClaimsManagerFactory.connect(contracts.claimsManager, signer);
  }, [signer, contracts]);
};

export const useArbitratorProxy = () => {
  const { signer, contracts } = useChainData();

  return useMemo(() => {
    if (!signer || !contracts) return null;

    return KlerosLiquidProxyFactory.connect(contracts.arbitratorProxy, signer);
  }, [signer, contracts]);
};

export const useProviderSubscriptions = () => {
  const { setChainData } = useChainData();

  const { connector } = useAccount({
    onDisconnect() {
      setChainData('User disconnected', initialChainData);
    },
  });

  useEffect(() => {
    if (!connector) return;

    const onChange = () => {
      // We clear the application state because data from one chain is invalid on another
      setChainData('Network/Account changed', initialChainData);
    };

    connector.on('change', onChange);
    return () => {
      connector.removeListener('change', onChange);
    };
  }, [connector, setChainData]);
};

/**
 * Use this hook to have a function called when either the network or selected
 * account is changed
 */
export const useOnAccountOrNetworkChange = (callback: () => void) => {
  const { networkName, userAccount } = useChainData();
  const prevUserAccount = usePrevious(userAccount);
  const prevNetworkName = usePrevious(networkName);

  useEffect(() => {
    if (prevUserAccount !== userAccount || prevNetworkName !== networkName) {
      callback();
    }
  }, [prevUserAccount, userAccount, prevNetworkName, networkName, callback]);
};

/**
 * Hook, which will trigger the callback function passed as an argument after one of the following conditions
 *  1) after a new block is mined
 *  2) when the component is mounted
 *  3) when network or account is changed
 *
 * The callback of this function is the ideal place to load chain data that should be kept in sync with latest
 * blockchain data.
 *
 * You can use the second argument of this function to trigger the callback only on certain conditions.
 *
 * NOTE: The 'block' event will also fire on the first subscription to this event. However, it will not be called for
 * further subscription. This means that the first triggered callback will be called twice (once because of subscription
 * and once because of hook being mounted). It might even be called three times when the user is first signed in.
 */
export const usePossibleChainDataUpdate = (
  callback: () => void,
  { triggerOnMinedBlock = true, triggerOnMount = true, triggerOnAccountOrNetworkChange = true } = {}
) => {
  const { provider } = useChainData();
  const isMount = useIsMount();

  useEffect(() => {
    if (!provider) return;

    const callbackWrapper = () => {
      if (triggerOnMinedBlock) callback();
    };

    provider.on('block', callbackWrapper);
    return () => {
      provider.removeListener('block', callbackWrapper);
    };
  }, [provider, triggerOnMinedBlock, callback]);

  useOnMountEffect(() => {
    if (triggerOnMount) {
      callback();
    }
  });

  useOnAccountOrNetworkChange(() => {
    // NOTE: We want to avoid triggering the callback on mount, because that is handled in a separate effect
    if (!isMount && triggerOnAccountOrNetworkChange) {
      callback();
    }
  });
};

/**
 * A hook that behaves like the useEffect hook, except that it also triggers the effect
 *  1) after a new block is mined
 *  2) when the network or account changes
 */
export function useChainUpdateEffect(effectFn: () => void | (() => void), effectDeps: any[]) {
  const { provider, networkName, userAccount } = useChainData();

  const effectFnRef = useRef(effectFn);
  useEffect(() => {
    effectFnRef.current = effectFn;
  });

  useEffect(() => {
    let cleanup = effectFnRef.current();

    if (!provider) {
      return () => cleanup?.();
    }

    let cancelled = false;
    // Multiple 'block' events are often emitted simultaneously (within a few milliseconds of each other),
    // so we debounce the event listener to avoid triggering the effect too much
    const blockMinedListener = debounce(() => {
      if (cancelled) return;
      cleanup?.();
      cleanup = effectFnRef.current();
    }, 20);

    provider.on('block', blockMinedListener);
    return () => {
      cancelled = true;
      provider.removeListener('block', blockMinedListener);
      cleanup?.();
    };
  }, [
    provider,
    networkName,
    userAccount,
    // eslint-disable-next-line react-hooks/exhaustive-deps
    ...effectDeps,
  ]);
}

/*
 * Hook that will trigger a notification when a new transaction is added to the state.
 */
export const useTransactionNotifications = () => {
  const { transactions } = useChainData();
  const prevTransactions = usePrevious(transactions);
  const [displayedTxHashes, setDisplayedTxHashes] = useState<string[]>([]);

  useEffect(() => {
    if (transactions.length > (prevTransactions || []).length) {
      const { type, tx } = transactions[transactions.length - 1]!;
      // Check if we've already displayed a notification for the given transaction hash
      const hasBeenDisplayed = displayedTxHashes.includes(tx.hash);
      if (!hasBeenDisplayed) {
        // No need to 'await' this promise. Let it resolve in the background
        displayPendingTransaction(tx, transactionMessages[type]);
        setDisplayedTxHashes([...displayedTxHashes, tx.hash]);
      }
    }
  }, [transactions, prevTransactions, displayedTxHashes]);
};
