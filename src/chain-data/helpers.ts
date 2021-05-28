import produce from 'immer';
import { ethers } from 'ethers';
import { getDaoAddresses, getNetworkName } from '../contracts';
import { initialChainData } from './state';

export const updateImmutably = <T>(state: T, updateCb: (immutableState: T) => void) => {
  // NOTE: This needs to be written in a function like this, to make sure `produce` doesn't return anything.
  // See: https://immerjs.github.io/immer/return/
  return produce(state, (draft) => {
    updateCb(draft as T);
  });
};

export const getChainData = async (provider: ethers.providers.Web3Provider | null) => {
  // If the user has disconnected
  if (!provider) return initialChainData;

  const networkName = await getNetworkName(provider);

  const newData = {
    userAccount: await provider.getSigner().getAddress(),
    networkName: networkName,
    contracts: getDaoAddresses(networkName),
  };

  return { ...newData, provider };
};
