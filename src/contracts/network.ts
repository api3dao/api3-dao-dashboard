import { ethers } from 'ethers';
import localhostDao from '../contract-deployments/localhost-dao.json';
import ropstenDao from '../contract-deployments/ropsten-dao.json';

export const getNetworkName = async (provider: ethers.providers.Web3Provider) => {
  const networkName = (await provider.getNetwork()).name;

  // NOTE: The localhost doesn't have a name, so set any unknown networks
  // to localhost. The network name is needed to display the "Unsupported Network"
  // message to the user if required.
  if (networkName === 'unknown') return 'localhost';
  else return networkName;
};

export const getSupportedNetworks = () => ['localhost', 'ropsten'];

export const getDaoAddresses = (networkName: string) => {
  switch (networkName) {
    case 'localhost':
      return localhostDao;
    case 'ropsten':
      return ropstenDao;
    default:
      return null;
  }
};

export const getWalletConnectRpcProviders = () => {
  return {
    3: process.env.REACT_APP_ROPSTEN_PROVIDER_URL,
    31337: 'http://127.0.0.1:8545/',
  };
};
