import { ethers } from 'ethers';
import { useEffect, useMemo, useState } from 'react';
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
 * Hook, which will trigger the callback function passed as an argument after every mined block or when the component is
 * mounted. If provider is null, the user is probably signed out. In that case the callback will be triggered once the
 * user signs in. This is ideal place to load chain data that should be kept in sync with latest blockchain data.
 *
 * If you want to disable the callback trigger on mount, pass false as second argument.
 *
 * NOTE: The 'block' event will also fire on the first subscription to this event. However, it will not be called for
 * further subscription. This means that the first triggered callback will be called twice (once because of subscription
 * and once because of hook being mounted).
 */
export const useMinedBlockAndMount = (callback: () => void, shouldTriggerOnMount = true) => {
  const { provider } = useChainData();
  const [didTriggerOnMount, setDidTriggerOnMount] = useState(false);

  useEffect(() => {
    if (!provider) return;

    provider.on('block', callback);
    return () => {
      provider.removeListener('block', callback);
    };
  }, [provider, callback]);

  useEffect(() => {
    // NOTE: We need to wait until provider becomes defined
    if (!provider) return;

    if (shouldTriggerOnMount && !didTriggerOnMount) {
      setDidTriggerOnMount(true);
      callback();
    }
  }, [provider, callback, shouldTriggerOnMount, didTriggerOnMount, setDidTriggerOnMount]);
};
