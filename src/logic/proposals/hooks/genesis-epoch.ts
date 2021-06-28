import { useCallback } from 'react';
import { useChainData } from '../../../chain-data';
import { useApi3Pool, usePossibleChainDataUpdate } from '../../../contracts';
import { notifications } from '../../../components/notifications/notifications';
import { go, isGoSuccess, GO_RESULT_INDEX, messages } from '../../../utils';

/**
 * Hook which loads the isGenesisEpoch boolean from the Api3Pool contract. Creating a
 * new proposal cannot be performed by the user until the genesis epoch has passed.
 */
export const useLoadGenesisEpoch = () => {
  const api3Pool = useApi3Pool();
  const { setChainData } = useChainData();

  const loadIsGenesisEpoch = useCallback(async () => {
    if (!api3Pool) return null;

    const goResponse = await go(api3Pool.isGenesisEpoch());
    if (!isGoSuccess(goResponse)) {
      notifications.error({
        message: messages.FAILED_TO_LOAD_GENESIS_EPOCH,
        errorOrMessage: messages.FAILED_TO_LOAD_GENESIS_EPOCH,
      });
      return;
    }

    const isGenesisEpoch = goResponse[GO_RESULT_INDEX];
    setChainData('Load isGenesisEpoch', { isGenesisEpoch });
  }, [api3Pool, setChainData]);

  usePossibleChainDataUpdate(loadIsGenesisEpoch);
};
