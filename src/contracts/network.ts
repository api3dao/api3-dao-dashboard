import { ethers } from 'ethers';
import localhostDao from '../contract-deployments/localhost-dao.json';
import rinkebyDao from '../contract-deployments/rinkeby-dao.json';

export const SUPPORTED_NETWORKS = ['localhost', 'rinkeby'];

export const getDaoAddresses = (networkName: string) => {
  switch (networkName) {
    case 'localhost':
      return localhostDao;
    case 'rinkeby':
      return rinkebyDao;
    default:
      return null;
  }
};

export const ETHERSCAN_HOSTS: { [chainId: string]: string } = {
  1: 'https://etherscan.io',
  3: 'https://ropsten.etherscan.io',
  4: 'https://rinkeby.etherscan.io',
  5: 'https://goerli.etherscan.io',
  42: 'https://kovan.etherscan.io',
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

export const WALLET_CONNECT_RPC_PROVIDERS = {
  4: process.env.REACT_APP_RINKEBY_PROVIDER_URL,
  31337: 'http://127.0.0.1:8545/',
};
