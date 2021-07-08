import { notifications } from '../components/notifications';
import { go, GO_ERROR_INDEX, GO_RESULT_INDEX, isGoSuccess } from './generic';
import { messages } from './messages';

type ErrorWithCode = Error & { code?: number };

// The Error object was extended to add a "code" for Web3 providers
// See: https://github.com/ethereum/EIPs/blob/master/EIPS/eip-1193.md#provider-errors
export const isUserRejection = (err: ErrorWithCode) => err.code === 4001 || err.code === 4100;

export const handleTransactionError = async <T>(transaction: Promise<T>) => {
  const goTransaction = await go(transaction);

  if (!isGoSuccess(goTransaction)) {
    if (isUserRejection(goTransaction[GO_ERROR_INDEX])) {
      notifications.info({ message: messages.TX_GENERIC_REJECTED });
      return;
    }
    notifications.error({ message: messages.TX_GENERIC_ERROR, errorOrMessage: goTransaction[GO_ERROR_INDEX] });
    return;
  }

  return goTransaction[GO_RESULT_INDEX];
};
