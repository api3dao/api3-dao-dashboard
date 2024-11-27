import { createContext, useState, useMemo, useContext, ReactNode } from 'react';
import { initialSettableChainData, initialChainData, SettableChainData, Proposal } from './state';
import { useAccount, useNetwork } from 'wagmi';
import { getDaoAddresses, updateNetworkName } from '../contracts';
import { useEthersProvider, useEthersSigner } from './adapters';
import { BigNumber, ethers } from 'ethers';
import testProposals from '../pages/proposals/test-proposals.json';

export const ChainDataContext = createContext(initialSettableChainData);

const ProviderSignerContext = createContext<null | {
  provider: ethers.providers.Provider;
  signer?: ethers.Signer;
}>(null);

const ChainDataContextProvider = (props: { children: ReactNode }) => {
  const [chainData, setChainData] = useState(initialChainData);
  // We call these adapter hooks here and provide the provider and signer with context, so that we use a
  // single instance of each across the app
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

const convertBigNumbersAndDates = (obj: any): any => {
  if (Array.isArray(obj)) {
    return obj.map(convertBigNumbersAndDates);
  } else if (obj && typeof obj === 'object') {
    return Object.keys(obj).reduce((acc, key) => {
      const value = obj[key];
      if (value && value.type === 'BigNumber' && value.hex) {
        acc[key] = BigNumber.from(value.hex);
      } else if (key === 'deadline' || key === 'startDate') {
        acc[key] = new Date(value);
      } else {
        acc[key] = convertBigNumbersAndDates(value);
      }
      return acc;
    }, {} as any);
  }
  return obj;
};

const convertToProposals = (
  data: any
): { primary: { [key: string]: Proposal }; secondary: { [key: string]: Proposal } } => {
  const convertSection = (section: { [key: string]: any }) => {
    return Object.keys(section).reduce((acc, key) => {
      acc[key] = convertBigNumbersAndDates(section[key]);
      return acc;
    }, {} as { [key: string]: Proposal });
  };

  return {
    primary: convertSection(data.primary),
    secondary: convertSection(data.secondary),
  };
};

export const useChainData = () => {
  const data = useContext(ChainDataContext);
  const { provider, signer } = useContext(ProviderSignerContext) || {};
  const { chain } = useNetwork();
  const { isConnected, address } = useAccount();

  // Note: The signer is briefly undefined after connecting or after switching networks.
  if (isConnected && address && provider && signer) {
    const networkName = updateNetworkName(chain?.network || '');
    return {
      ...data,
      // proposals: convertToProposals(testProposals),
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
