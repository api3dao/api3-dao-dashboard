import produce from 'immer';
import { ethers } from 'ethers';
import { getDaoAddresses, getNetworkName } from '../contracts';
import { initialChainData } from './state';
import { go, GO_RESULT_INDEX, isGoSuccess } from '../utils';

export const updateImmutably = <T>(state: T, updateCb: (immutableState: T) => void) => {
  // NOTE: This needs to be written in a function like this, to make sure `produce` doesn't return anything.
  // See: https://immerjs.github.io/immer/return/
  return produce(state, (draft) => {
    updateCb(draft as T);
  });
};

export const getNetworkData = async (provider: ethers.providers.Web3Provider | null) => {
  // If the user has disconnected
  if (!provider) return initialChainData;

  const goResponse = await go(provider.getSigner().getAddress());
  // Happens when the user locks his metamask account
  if (!isGoSuccess(goResponse)) return initialChainData;

  const networkName = await getNetworkName(provider);
  const newData = {
    userAccount: goResponse[GO_RESULT_INDEX],
    networkName: networkName,
    contracts: getDaoAddresses(networkName),
  };

  return { ...newData, provider };
};

export const abbrStr = (str: string) => {
  return str.substr(0, 9) + '...' + str.substr(str.length - 4, str.length);
};
