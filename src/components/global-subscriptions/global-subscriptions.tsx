import { useEffect } from 'react';
import { getChainData, useChainData } from '../../chain-data';

const GlobalSubscriptions = () => {
  const { provider, setChainData, ...otherChainData } = useChainData();

  useEffect(() => {
    if (!provider) return;

    const onNewBlock = (latestBlock: number) => {
      setChainData({ ...otherChainData, provider, latestBlock });
    };

    const onRefreshChainData = async () => {
      setChainData({ ...otherChainData, ...(await getChainData(provider)) });
    };

    provider.on('block', onNewBlock);

    // Web3Modal recommends handling all of the following events
    // See: https://github.com/Web3Modal/web3modal#provider-events
    provider.on('accountsChanged', () => onRefreshChainData());
    provider.on('chainChanged', () => onRefreshChainData());
    // Chain data is already refreshed immediately on sign
    provider.on('connect', () => {});
    // Chain data is cleared immediately through the "disconnect" button
    provider.on('disconnect', () => {});

    return () => {
      provider.off('block', onNewBlock);
      provider.off('accountsChanged', () => onRefreshChainData());
      provider.off('chainChanged', () => onRefreshChainData());
      provider.off('connect', () => {});
      provider.off('disconnect', () => {});
    };
  }, [provider, setChainData, otherChainData]);

  return null;
};

export default GlobalSubscriptions;
