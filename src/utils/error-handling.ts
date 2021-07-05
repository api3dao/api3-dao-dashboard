import { notifications } from '../components/notifications/notifications';
import { go, GO_ERROR_INDEX, GO_RESULT_INDEX, isGoSuccess, isUserRejection } from './generic';
import { messages } from './messages';

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
