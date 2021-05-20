import { useEffect } from 'react';
import { useChainData } from '../chain-data';

export const useRefreshLatestBlock = () => {
  const { provider, setChainData, ...otherChainData } = useChainData();

  useEffect(() => {
    if (!provider) return;

    const handler = (latestBlock: number) => {
      setChainData({ ...otherChainData, provider, latestBlock });
    };

    provider.on('block', handler);
    return () => {
      provider.off('block', handler);
    };
  }, [provider, setChainData, otherChainData]);
};
