import { ethers } from 'ethers';
import type localhostDao from '../contract-deployments/localhost-dao.json';

type ContractsInfo = typeof localhostDao['contracts'];

interface ChainData {
  provider: ethers.providers.Web3Provider | null;
  userAccount: string;
  networkName: string;
  chainId: string;
  contracts: ContractsInfo | null;
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
};

export const initialSettableChainData: SettableChainData = { ...initialChainData, setChainData: () => {} };
