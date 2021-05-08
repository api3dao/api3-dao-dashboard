import { useMemo } from 'react';
import { useChainData } from '../chain-data';
import { Api3Pool__factory as Api3PoolFactory, Api3Token__factory as Api3TokenFactory } from '../generated-contracts';

export const useApi3Pool = () => {
  const { provider, contracts } = useChainData();

  return useMemo(() => {
    if (!provider || !contracts) return null;
    return Api3PoolFactory.connect(contracts.Api3Pool.address, provider.getSigner());
  }, [provider, contracts]);
};

export const useApi3Token = () => {
  const { provider, contracts } = useChainData();

  return useMemo(() => {
    if (!provider || !contracts) return null;
    return Api3TokenFactory.connect(contracts.Api3Token.address, provider.getSigner());
  }, [provider, contracts]);
};
