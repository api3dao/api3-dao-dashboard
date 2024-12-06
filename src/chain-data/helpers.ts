import produce from 'immer';
import { ethers, providers } from 'ethers';
import { notifications } from '../components/notifications';
import { getEtherscanTransactionUrl } from '../contracts';
import { go } from '@api3/promise-utils';

export const updateImmutably = <T>(state: T, updateCb: (immutableState: T) => void) => {
  // NOTE: This needs to be written in a function like this, to make sure `produce` doesn't return anything.
  // See: https://immerjs.github.io/immer/return/
  return produce(state, (draft) => {
    updateCb(draft as T);
  });
};

export const updateImmutablyCurried =
  <T>(updateCb: (immutableState: T) => void) =>
  (state: T) =>
    updateImmutably(state, updateCb);

export const abbrStr = (str: string) => {
  return str.substring(0, 5) + '...' + str.substring(str.length - 4, str.length);
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

  const goRes = await go(() => transaction.wait());
  if (infoToastId) notifications.close(infoToastId);

  // NOTE: ethers.js adds various additional fields to Error, so it's easier to type as 'any'
  // https://docs.ethers.io/v5/api/providers/types/#providers-TransactionResponse
  if (!goRes.success) {
    const ethersError = goRes.error as any;
    // Transactions can be "replaced" or "cancelled". We don't need to worry about "repriced"
    // See: https://blog.ricmoo.com/highlights-ethers-js-may-2021-2826e858277d
    if (ethersError.code !== ethers.errors.TRANSACTION_REPLACED) return;

    // The user "cancelled" the transaction. i.e. it was resent with the same
    // nonce, but higher gas price, value as 0 and data as 0x
    if (ethersError.cancelled) {
      return notifications.success({ message: 'Success! Transaction cancelled' });
    }

    // The user "sped up" their transaction by resending it with a higher gas price
    if (ethersError.replacement && ethersError.replacement.hash) {
      const replacementTxUrl = getEtherscanTransactionUrl(ethersError.replacement);
      return notifications.success({ url: replacementTxUrl, message: messages.success });
    }

    // A receipt with status 0 means the transaction failed
    if (ethersError.receipt?.status === 0) {
      return notifications.error({ url, message: messages.error, errorOrMessage: messages.error });
    }

    return;
  }

  const receipt = goRes.data;
  // A receipt with status 0 means the transaction failed and 1 indicates success
  if (receipt.status === 0) {
    return notifications.error({ url, message: messages.error, errorOrMessage: messages.error });
  }

  if (receipt.status === 1) {
    return notifications.success({ url, message: messages.success });
  }
};

// Injects a mocked ethers provider set to make RPC calls to node running on localhost
export const mockLocalhostWeb3Provider = (window: Window) => {
  const ethersProvider = new providers.JsonRpcProvider('http://localhost:8545');

  // The request `request` function is defined when we use Metamask, so we mock it
  (ethersProvider as any).request = ({ method, params }: any) => {
    if (method === 'eth_requestAccounts') method = 'eth_accounts';
    return ethersProvider.send(method, params);
  };
  // Simulate injected metamask metamask provider
  (window as any).ethereum = ethersProvider;
};
