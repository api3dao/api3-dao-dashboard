import { useEffect, useMemo, useState } from 'react';
import { useAccount } from 'wagmi';
import { transactionMessages, usePrevious, useIsMount, useOnMountEffect } from '../utils';
import { useChainData, displayPendingTransaction } from '../chain-data';
import {
  Api3Pool__factory as Api3PoolFactory,
  Api3Token__factory as Api3TokenFactory,
  Api3Voting__factory as Api3VotingFactory,
  Convenience__factory as ConvenienceFactory,
  TimelockManager__factory as TimelockManagerFactory,
} from './artifacts/factories';
import { initialChainData } from '../chain-data/state';

const useContractReader = () => {
  const { contracts, provider, signer } = useChainData();
  const { connector } = useAccount();

  /*
   * Please note the following:
   * 1. When connected via non-browser wallets (like via Wallet Connect), loading contract data fails when the smart
   *    contract was constructed with a signer.
   * 2. Data loads a considerable amount faster when the provider of the browser wallet is used. Web3Modal supports
   *    EIP6963 which can be used to detect multiple in-browser wallets.
   *
   * The "MetaMask" connector name is probably not needed anymore after Web3Modal supports EIP6963, but this likely
   * depends on the version of MM browser wallet. We keep it to be sure we are compatible with the previous version of
   * DAO dashboard.
   */
  const isBrowserWallet = connector?.name === 'EIP6963' || connector?.name === 'MetaMask';
  const reader = isBrowserWallet ? signer : provider;
  return {
    contracts,
    reader,
  };
};

export const useApi3Pool = () => {
  const { contracts, reader } = useContractReader();

  return useMemo(() => {
    if (!contracts || !reader) return null;
    return Api3PoolFactory.connect(contracts.api3Pool, reader);
  }, [reader, contracts]);
};

export const useApi3Token = () => {
  const { contracts, reader } = useContractReader();

  return useMemo(() => {
    if (!contracts || !reader) return null;
    return Api3TokenFactory.connect(contracts.api3Token, reader);
  }, [reader, contracts]);
};

export const useApi3Voting = () => {
  const { contracts, reader } = useContractReader();

  return useMemo(() => {
    if (!contracts || !reader) return null;
    return {
      primary: Api3VotingFactory.connect(contracts.votingAppPrimary, reader),
      secondary: Api3VotingFactory.connect(contracts.votingAppSecondary, reader),
    };
  }, [reader, contracts]);
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
  const { contracts, reader } = useContractReader();

  return useMemo(() => {
    if (!contracts || !reader) return null;

    return ConvenienceFactory.connect(contracts.convenience, reader);
  }, [reader, contracts]);
};

export const useTimelockManager = () => {
  const { contracts, reader } = useContractReader();

  return useMemo(() => {
    if (!contracts || !reader) return null;

    return TimelockManagerFactory.connect(contracts.timelockManager, reader);
  }, [reader, contracts]);
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
