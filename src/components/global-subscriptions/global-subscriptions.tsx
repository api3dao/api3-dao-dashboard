import { useEffect } from 'react';
import { getChainData, useChainData } from '../../chain-data';

const GlobalSubscriptions = () => {
  const { provider, setChainData, ...otherChainData } = useChainData();

  useEffect(() => {
    const { web3Modal } = otherChainData;
    if (!provider || !web3Modal) return;

    const onNewBlock = (latestBlock: number) => {
      setChainData({ ...otherChainData, provider, latestBlock });
    };

    const onRefreshChainData = () => {
      return async () => {
        setChainData({ ...otherChainData, ...(await getChainData(provider)) });
      };
    };

    provider.on('block', onNewBlock);

    const noOp = () => {};

    // Ethers.js doesn't expose EIP-1193 events directly
    // Web3Modal recommends handling all of the following events
    // See: https://github.com/Web3Modal/web3modal#provider-events
    web3Modal.on('accountsChanged', onRefreshChainData);
    web3Modal.on('chainChanged', onRefreshChainData);
    // Chain data is already refreshed immediately on sign in
    web3Modal.on('connect', noOp);
    // Chain data is cleared immediately through the "disconnect" button
    web3Modal.on('disconnect', noOp);

    return () => {
      // NOTE: Unsubscribing MUST reference the same function
      // reference if it is provided as a second argument
      provider.off('block', onNewBlock);

      web3Modal.off('accountsChanged', onRefreshChainData);
      web3Modal.off('chainChanged', onRefreshChainData);
      web3Modal.off('connect', noOp);
      web3Modal.off('disconnect', noOp);
    };
  }, [provider, setChainData]); // eslint-disable-line react-hooks/exhaustive-deps

  return null;
};

export default GlobalSubscriptions;
