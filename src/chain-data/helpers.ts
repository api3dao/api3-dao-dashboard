import produce from 'immer';
import { ethers } from 'ethers';
import { notifications } from '../components/notifications/notifications';
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

export interface PendingTransactionMessages {
  start: string;
  success: string;
  error: string;
}

export const displayPendingTransaction = async (
  transaction: ethers.ContractTransaction,
  messages: PendingTransactionMessages
) => {
  // Non-mainnet networks have different Etherscan subdomains
  const etherscanHost = process.env.REACT_APP_ETHERSCAN_HOST || 'https://etherscan.io';
  const url = `${etherscanHost}/tx/${transaction.hash}`;

  // It's common for transactions to take between 1-5 minutes to confirm. Keep the
  // initial "progress" toast open until then
  const infoToastId = notifications.info({ url, message: messages.success }, { autoClose: false });

  // NOTE: ethers.js adds various additional fields to Error, so it's easier to type as 'any'
  // https://docs.ethers.io/v5/api/providers/types/#providers-TransactionRequest
  const [err] = (await go(transaction.wait())) as any;

  if (infoToastId) notifications.close(infoToastId);

  if (err) {
    // A receipt with status 0 means the transaction failed
    if (err.receipt?.status.toString() === '0') {
      notifications.error({ url, message: messages.error });
      return;
    }

    // If the user resends a transaction with the same nonce and higher gas price
    if (err.reason === 'replaced' && err.replacement) {
      await displayPendingTransaction(err.replacement, messages);
      return;
    }
  }

  notifications.success({ url, message: messages.success });
};
