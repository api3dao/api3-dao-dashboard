import { createContext, useState, useMemo, useContext, ReactNode } from 'react';
import { initialSettableChainData, initialChainData, SettableChainData } from './state';
import { useAccount, useNetwork, useProvider, useSigner } from 'wagmi';
import { getDaoAddresses, updateNetworkName } from '../contracts';

export const ChainDataContext = createContext(initialSettableChainData);

const ChainDataContextProvider = (props: { children: ReactNode }) => {
  const [chainData, setChainData] = useState(initialChainData);

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
      {props.children}
    </ChainDataContext.Provider>
  );
};

export default ChainDataContextProvider;

export const useChainData = () => {
  const data = useContext(ChainDataContext);
  const { chain } = useNetwork();
  const provider = useProvider({ chainId: chain?.id });
  const { data: signer } = useSigner({ chainId: chain?.id });

  const { isConnected, address } = useAccount();

  if (isConnected && address && signer) {
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
