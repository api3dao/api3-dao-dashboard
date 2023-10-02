import { createContext, useState, useMemo, useContext, ReactNode } from 'react';
import { initialSettableChainData, initialChainData, SettableChainData } from './state';
import { useAccount, useNetwork } from 'wagmi';
import { getDaoAddresses, updateNetworkName } from '../contracts';
import { useEthersProvider, useEthersSigner } from './adapters';
import { ethers } from 'ethers';

export const ChainDataContext = createContext(initialSettableChainData);

const ProviderSignerContext = createContext<null | {
  provider: ethers.providers.Provider;
  signer?: ethers.Signer;
}>(null);

const ChainDataContextProvider = (props: { children: ReactNode }) => {
  const [chainData, setChainData] = useState(initialChainData);
  // We call these adapter hooks here and provide them with context, so that we use a single instance of each
  // across the codebase
  const provider = useEthersProvider();
  const signer = useEthersSigner();

  const loggableSetChainData = useMemo(() => {
    const setter: SettableChainData['setChainData'] = (reason, dataOrCallback) => {
      setChainData((oldChainData) => {
        const newChainData = typeof dataOrCallback === 'function' ? dataOrCallback(oldChainData) : dataOrCallback;
        const updatedChainData = { ...oldChainData, ...newChainData };

        if (process.env.NODE_ENV === 'development') {
          console.group(reason);
          // eslint-disable-next-line no-console
          console.info(updatedChainData);
          console.groupEnd();
        }

        return updatedChainData;
      });
    };

    return setter;
  }, []);

  return (
    <ChainDataContext.Provider value={{ ...chainData, setChainData: loggableSetChainData }}>
      <ProviderSignerContext.Provider value={{ provider, signer }}>{props.children}</ProviderSignerContext.Provider>
    </ChainDataContext.Provider>
  );
};

export default ChainDataContextProvider;

export const useChainData = () => {
  const data = useContext(ChainDataContext);
  const { chain } = useNetwork();
  const { provider, signer } = useContext(ProviderSignerContext) || {};
  const { isConnected, address } = useAccount();

  // Note: The signer is briefly undefined after connecting or after switching networks.
  if (isConnected && address && provider && signer) {
    const networkName = updateNetworkName(chain?.network || '');
    return {
      ...data,
      isConnected: true,
      provider,
      signer,
      userAccount: address,
      chainId: chain?.id,
      networkName,
      contracts: getDaoAddresses(networkName),
    };
  }

  return {
    ...data,
    isConnected: false,
    provider: null,
    signer: null,
    userAccount: '',
    chainId: undefined,
    networkName: '',
    contracts: null,
  };
};
