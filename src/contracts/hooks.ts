import { ethers } from 'ethers';
import { useEffect, useMemo } from 'react';
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
 * Hook, which will trigger the callback function passed as an argument after every mined block. The callback is also
 * triggered immediately after we subscribe to 'block' event. This is ideal place to load chain data that should be kept
 * in sync with latest blockchain data.
 */
export const useMinedBlockAndMount = (callback: () => void) => {
  const { provider } = useChainData();

  useEffect(() => {
    if (!provider) return;

    provider.on('block', callback);
    return () => {
      provider.removeListener('block', callback);
    };
  }, [provider, callback]);
};
