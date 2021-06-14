import { useCallback } from 'react';
import { Treasury, useChainData } from '../../chain-data';
import { useApi3Voting, useConvenience, usePossibleChainDataUpdate } from '../../contracts/hooks';
import { isGoSuccess, blockTimestampToDate, go, GO_RESULT_INDEX, assertGoSuccess } from '../../utils';
import { isZeroAddress } from '../../contracts';
import * as notifications from '../../components/notifications/notifications';
import { messages } from '../../utils/messages';

export const useTreasuryAndDelegation = () => {
  const { setChainData, userAccount, proposals } = useChainData();

  const api3Voting = useApi3Voting();
  const convenience = useConvenience();

  const reloadTreasuryAndDelegation = useCallback(async () => {
    if (!api3Voting || !convenience) return;

    const loadTreasuryAndDelegation = async () => {
      const goResponse = await go(convenience.getTreasuryAndUserDelegationData(userAccount));
      assertGoSuccess(goResponse);
      const data = goResponse[GO_RESULT_INDEX];

      const treasury: Treasury[] = [];
      for (let i = 0; i < data.names.length; i++) {
        treasury.push({
          name: data.names[i],
          symbol: data.symbols[i],
          decimal: data.decimals[i],
          balanceOfPrimaryAgent: data.balancesOfPrimaryAgent[i],
          balanceOfSecondaryAgent: data.balancesOfSecondaryAgent[i],
        });
      }

      return {
        delegation: {
          proposalVotingPowerThreshold: data.proposalVotingPowerThreshold,
          userVotingPower: data.userVotingPower,
          delegate: isZeroAddress(data.delegate) ? null : data.delegate,
          lastDelegationUpdateTimestamp: blockTimestampToDate(data.lastDelegationUpdateTimestamp),
          lastProposalTimestamp: blockTimestampToDate(data.lastProposalTimestamp),
        },
        treasury,
      };
    };

    const goResponse = await go(loadTreasuryAndDelegation);
    if (!isGoSuccess(goResponse)) {
      notifications.error({ message: messages.FAILED_TO_LOAD_TREASURY_AND_DELEGATION });
      return;
    }

    const treasuryAndDelegation = goResponse[GO_RESULT_INDEX];

    setChainData('Load delegation and treasury', (state) => ({
      ...state,
      ...treasuryAndDelegation,
    }));
  }, [api3Voting, convenience, userAccount, setChainData]);

  // Ensure that the proposals are up to date with blockchain
  usePossibleChainDataUpdate(reloadTreasuryAndDelegation);

  return proposals;
};
