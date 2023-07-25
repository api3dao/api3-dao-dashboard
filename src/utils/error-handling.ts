import { go } from '@api3/promise-utils';
import { notifications } from '../components/notifications';
import { messages } from './messages';

type ErrorWithCode = Error & { code?: number };

// The Error object was extended to add a "code" for Web3 providers
// See: https://github.com/ethereum/EIPs/blob/master/EIPS/eip-1193.md#provider-errors
export const isUserRejection = (err: ErrorWithCode) => err.code === 4001 || err.code === 4100;

export const handleTransactionError = async <T>(transaction: Promise<T>) => {
  const goTransaction = await go(() => transaction);

  if (!goTransaction.success) {
    if (isUserRejection(goTransaction.error)) {
      notifications.info({ message: messages.TX_GENERIC_REJECTED });
      return;
    }
    notifications.error({ message: messages.TX_GENERIC_ERROR, errorOrMessage: goTransaction.error });
    return;
  }

  return goTransaction.data;
};
