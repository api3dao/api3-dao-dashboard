import { ethers } from 'ethers';
import { useEffect, useMemo } from 'react';
import { useIsMount, useOnMountEffect, usePrevious } from '../utils';
import { getChainData, useChainData } from '../chain-data';
import {
  Api3Pool__factory as Api3PoolFactory,
  Api3Token__factory as Api3TokenFactory,
  Api3Voting__factory as Api3VotingFactory,
  Convenience__factory as ConvenienceFactory,
} from '../generated-contracts';

export const useApi3Pool = () => {
  const { provider, contracts } = useChainData();

  return useMemo(() => {
    if (!provider || !contracts) return null;
    return Api3PoolFactory.connect(contracts.api3Pool, provider.getSigner());
  }, [provider, contracts]);
};

export const useApi3Token = () => {
  const { provider, contracts } = useChainData();

  return useMemo(() => {
    if (!provider || !contracts) return null;
    return Api3TokenFactory.connect(contracts.api3Token, provider.getSigner());
  }, [provider, contracts]);
};

export const useApi3Voting = () => {
  const { provider, contracts } = useChainData();

  return useMemo(() => {
    if (!provider || !contracts) return null;
    return {
      primary: Api3VotingFactory.connect(contracts.votingAppPrimary, provider.getSigner()),
      secondary: Api3VotingFactory.connect(contracts.votingAppSecondary, provider.getSigner()),
    };
  }, [provider, contracts]);
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
  const { provider, contracts } = useChainData();

  return useMemo(() => {
    if (!provider || !contracts) return null;

    return ConvenienceFactory.connect(contracts.convenience, provider.getSigner());
  }, [provider, contracts]);
};

/**
 * Subscribe to events specified in EIP-1193. See: https://github.com/ethereum/EIPs/blob/master/EIPS/eip-1193.md
 */
export const useProviderSubscriptions = (provider: ethers.providers.Web3Provider | null) => {
  const { setChainData } = useChainData();

  useEffect(() => {
    if (!provider) return;

    const refreshChainData = async () => {
      setChainData('EIP-1193 event triggered', { ...(await getChainData(provider)) });
    };

    const underlyingProvider = provider.provider as ethers.providers.Provider;
    // https://github.com/ethers-io/ethers.js/issues/1396
    underlyingProvider.on('accountsChanged', refreshChainData);
    underlyingProvider.on('chainChanged', refreshChainData);
    underlyingProvider.on('disconnect', refreshChainData);

    return () => {
      underlyingProvider.removeListener('accountsChanged', refreshChainData);
      underlyingProvider.removeListener('chainChanged', refreshChainData);
      underlyingProvider.removeListener('disconnect', refreshChainData);
    };
  }, [provider, setChainData]);
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
