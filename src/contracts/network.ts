import { ethers } from 'ethers';
import localhostDao from '../contract-deployments/localhost-dao.json';
import mainnetDao from '../contract-deployments/mainnet-dao.json';

export const SUPPORTED_NETWORKS = ['hardhat', 'mainnet'];

export const updateNetworkName = (networkName: string) => {
  // NOTE: The localhost doesn't have a name, so set any unknown networks
  // to localhost. The network name is needed to display the "Unsupported Network"
  // message to the user if required and in "connected to" status panel.
  if (networkName === 'unknown') return 'hardhat';
  // Convert "homestead" to mainnet for convenience
  if (networkName === 'homestead') return 'mainnet';

  return networkName;
};

export const getDaoAddresses = (networkName: string) => {
  switch (networkName) {
    case 'hardhat':
      return localhostDao;
    case 'mainnet':
      return mainnetDao;
    default:
      return null;
  }
};

export const ETHERSCAN_HOSTS: { [chainId: string]: string } = {
  1: 'https://etherscan.io',
};

export const getEtherscanTransactionUrl = (transaction: ethers.Transaction) => {
  const host = ETHERSCAN_HOSTS[transaction.chainId.toString()];
  if (!host) return;

  // For example: https://ropsten.etherscan.io/tx/0xe4394ea70b32486f59f92c5194c9083bd36c99f2f0c32cfc9bacce3486055d24
  return [host, 'tx', transaction.hash].join('/');
};

export const getEtherscanAddressUrl = (chainId: number | undefined, address: string) => {
  if (!chainId) return;

  const host = ETHERSCAN_HOSTS[chainId];
  if (!host) return;

  // For example: https://etherscan.io/address/0xb0A20975f540656E331e2331C6caEc608Ff254fc
  return [host, 'address', address].join('/');
};
