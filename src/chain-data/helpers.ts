import produce from 'immer';
import { ethers } from 'ethers';
import { notifications } from '../components/notifications/notifications';
import { getDaoAddresses, getEtherscanTransactionUrl } from '../contracts';
import { initialChainData } from './state';
import { go, GO_RESULT_INDEX, isGoSuccess } from '../utils';

export const updateImmutably = <T>(state: T, updateCb: (immutableState: T) => void) => {
  // NOTE: This needs to be written in a function like this, to make sure `produce` doesn't return anything.
  // See: https://immerjs.github.io/immer/return/
  return produce(state, (draft) => {
    updateCb(draft as T);
  });
};

export const updateImmutablyCurried = <T>(updateCb: (immutableState: T) => void) => (state: T) =>
  updateImmutably(state, updateCb);

export const getNetworkData = async (provider: ethers.providers.Web3Provider | null) => {
  // If the user has disconnected
  if (!provider) return initialChainData;

  const goResponse = await go(provider.getSigner().getAddress());
  // Happens when the user locks his metamask account
  if (!isGoSuccess(goResponse)) return initialChainData;

  const network = await provider.getNetwork();

  let networkName = network.name;
  // NOTE: The localhost doesn't have a name, so set any unknown networks
  // to localhost. The network name is needed to display the "Unsupported Network"
  // message to the user if required and in "connected to" status panel.
  if (networkName === 'unknown') networkName = 'localhost';

  const newData = {
    userAccount: goResponse[GO_RESULT_INDEX],
    networkName: networkName,
    chainId: network.chainId,
    contracts: getDaoAddresses(networkName),
  };

  return { ...newData, provider };
};

export const abbrStr = (str: string) => {
  return str.substr(0, 9) + '...' + str.substr(str.length - 4, str.length);
};

export interface PendingTransactionMessages {
  start: string;
  success: string;
  error: string;
}

export const displayPendingTransaction = async (
  transaction: ethers.ContractTransaction,
  messages: PendingTransactionMessages
) => {
  const url = getEtherscanTransactionUrl(transaction);

  // It's common for transactions to take between 1-5 minutes to confirm. Keep the
  // initial "progress" toast open until then
  const infoToastId = notifications.info(
    { url: url, message: messages.start },
    { autoClose: false, closeOnClick: false }
  );

  const [err, receipt] = await go(transaction.wait());

  if (infoToastId) notifications.close(infoToastId);

  // NOTE: ethers.js adds various additional fields to Error, so it's easier to type as 'any'
  // https://docs.ethers.io/v5/api/providers/types/#providers-TransactionResponse
  const ethersError = err as any;
  if (ethersError) {
    // Transactions can be "replaced" or "cancelled". We don't need to worry about "repriced"
    // See: https://blog.ricmoo.com/highlights-ethers-js-may-2021-2826e858277d
    if (ethersError.code === ethers.errors.TRANSACTION_REPLACED) {
      // The user "cancelled" the transaction. i.e. it was resent with the same
      // nonce, but higher gas price, value as 0 and data as 0x
      if (ethersError.cancelled) {
        notifications.success({ message: 'Transaction cancelled successfully' });
        return;
      }

      // The user "sped up" their transaction by resending it with a higher gas price
      if (ethersError.replacement && ethersError.replacement.hash) {
        const replacementTxUrl = getEtherscanTransactionUrl(ethersError.replacement);
        notifications.success({ url: replacementTxUrl, message: messages.success });
        return;
      }

      // A receipt with status 0 means the transaction failed
      if (ethersError.receipt?.status === 0) {
        notifications.error({ url, message: messages.error, errorOrMessage: messages.error });
        return;
      }
    }
  }

  if (receipt) {
    // A receipt with status 0 means the transaction failed and 1 indicates success
    if (receipt.status === 0) {
      notifications.error({ url, message: messages.error, errorOrMessage: messages.error });
      return;
    }

    if (receipt.status === 1) {
      notifications.success({ url, message: messages.success });
      return;
    }
  }
};
