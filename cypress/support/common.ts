import { providers } from 'ethers';

export const ethersProvider = new providers.JsonRpcProvider('http://localhost:8545');

export const EPOCH_LENGTH = 7 * 60 * 60 * 24; // in seconds
