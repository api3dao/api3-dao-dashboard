import { ethers } from 'ethers';

interface ChainData {
  provider: ethers.providers.Provider | null;
  userAccount: string;
  networkName: string;
  chainId: string;
}

interface SettableChainData extends ChainData {
  setChainData: (newChainData: ChainData) => void;
}

export const initialChainData: ChainData = {
  provider: null,
  userAccount: '',
  networkName: '',
  chainId: '',
};

export const initialSettableChainData: SettableChainData = { ...initialChainData, setChainData: () => {} };
