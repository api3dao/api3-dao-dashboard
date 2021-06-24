import { providers } from 'ethers';

export const ethersProvider = new providers.JsonRpcProvider('http://localhost:8545');

export const abbrStr = (str: string) => {
  return str.substr(0, 9) + '...' + str.substr(str.length - 4, str.length);
};

export const EPOCH_LENGTH = 7 * 60 * 60 * 24; // in seconds
