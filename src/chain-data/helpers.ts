import produce from 'immer';
import { ethers } from 'ethers';
import { daoAbis } from '../contracts/abis';

export const updateImmutably = <T>(state: T, updateCb: (immutableState: T) => void) => {
  // NOTE: This needs to be written in a function like this, to make sure `produce` doesn't return anything.
  // See: https://immerjs.github.io/immer/return/
  return produce(state, (draft) => {
    updateCb(draft as T);
  });
};

export const getChainData = async (provider: ethers.providers.Web3Provider) => {
  const networkChainId = (await provider.getNetwork()).chainId.toString();

  const daoNetwork = daoAbis.find(({ chainId }) => chainId === networkChainId);

  const newData = {
    userAccount: await provider.getSigner().getAddress(),
    networkName: (await provider.getNetwork()).name,
    chainId: networkChainId,
    contracts: daoNetwork?.contracts ?? null,
    latestBlock: await provider.getBlockNumber(),
  };
  if (newData.networkName === 'unknown') newData.networkName = 'localhost';

  return { ...newData, provider };
};
