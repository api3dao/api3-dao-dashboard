import { ethers } from 'ethers';
import type localhostDao from '../contract-deployments/localhost-dao.json';

type ContractsInfo = typeof localhostDao['contracts'];

export interface ChainData {
  provider: ethers.providers.Web3Provider | null;
  userAccount: string;
  networkName: string;
  chainId: string;
  contracts: ContractsInfo | null;
  latestBlock: number;
}

interface SettableChainData extends ChainData {
  setChainData: (newChainData: ChainData) => void;
}

export const initialChainData: ChainData = {
  provider: null,
  userAccount: '',
  networkName: '',
  chainId: '',
  contracts: null,
  latestBlock: 0,
};

export const initialSettableChainData: SettableChainData = { ...initialChainData, setChainData: () => {} };
