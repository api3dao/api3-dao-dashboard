import produce from 'immer';
import { ethers } from 'ethers';
import { getDaoAddresses, getNetworkName } from '../contracts';

export const updateImmutably = <T>(state: T, updateCb: (immutableState: T) => void) => {
  // NOTE: This needs to be written in a function like this, to make sure `produce` doesn't return anything.
  // See: https://immerjs.github.io/immer/return/
  return produce(state, (draft) => {
    updateCb(draft as T);
  });
};

export const getChainData = async (provider: ethers.providers.Web3Provider) => {
  const networkName = await getNetworkName(provider);

  const newData = {
    userAccount: await provider.getSigner().getAddress(),
    networkName: (await provider.getNetwork()).name,
    contracts: getDaoAddresses(networkName),
    latestBlock: await provider.getBlockNumber(),
  };

  return { ...newData, provider };
};
