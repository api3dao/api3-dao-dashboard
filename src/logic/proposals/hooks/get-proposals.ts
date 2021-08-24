import { BigNumber, providers } from 'ethers';
import { ProposalType, VoterState } from '../../../chain-data';
import { Convenience } from '../../../generated-contracts';
import { Proposal } from '../../../chain-data';
import { decodeEvmScript, decodeMetadata } from '../encoding';
import { blockTimestampToDate } from '../../../utils';
import { EPOCH_LENGTH, HUNDRED_PERCENT, isZeroAddress } from '../../../contracts';
import { StartVoteProposal, VOTING_APP_IDS } from './commons';
import { convertToEnsName } from '../encoding/ens-name';
import range from 'lodash/range';

const toPercent = (value: BigNumber) => value.mul(100).div(HUNDRED_PERCENT).toNumber();

/**
 * Helper function which loads all necessary proposal data for multiple proposals in parallel.
 */
export const getProposals = async (
  provider: providers.Web3Provider,
  convenience: Convenience,
  userAccount: string,
  startVoteProposals: StartVoteProposal[],
  openVoteIds: BigNumber[],
  type: ProposalType
): Promise<Proposal[]> => {
  // NOTE: For now, let's skip the invalid proposals. Later we can do something more clever about it
  const validStartVoteProposals = startVoteProposals.filter((p) => decodeMetadata(p.metadata) !== null);

  const startVotesInfo = validStartVoteProposals.map((p) => {
    const metadata = decodeMetadata(p.metadata)!;
    return {
      ...p,
      metadata,
    };
  });

  const votingTime = EPOCH_LENGTH;
  const voteIdsToLoad = startVotesInfo.map((log) => log.voteId);
  const openVoteIdsStr = openVoteIds.map((id) => id.toString());
  const staticVoteData = await convenience.getStaticVoteData(VOTING_APP_IDS[type], userAccount, voteIdsToLoad);
  const dynamicVoteData = await convenience.getDynamicVoteData(VOTING_APP_IDS[type], userAccount, voteIdsToLoad);

  const composeProposal = async (i: number): Promise<Proposal> => {
    const script = staticVoteData.script[i]!;
    const decodedEvmScript = await decodeEvmScript(provider, script, startVotesInfo[i]!.metadata);

    return {
      type,
      ...startVotesInfo[i]!,
      open: openVoteIdsStr.includes(startVotesInfo[i]!.voteId.toString()),
      creatorName: await convertToEnsName(provider, startVotesInfo[i]!.creator),

      startDate: blockTimestampToDate(staticVoteData.startDate[i]!),
      supportRequired: toPercent(staticVoteData.supportRequired[i]!),
      minAcceptQuorum: toPercent(staticVoteData.minAcceptQuorum[i]!),
      votingPower: staticVoteData.votingPower[i]!,
      deadline: blockTimestampToDate(staticVoteData.startDate[i]!.add(votingTime)),
      startDateRaw: staticVoteData.startDate[i]!,
      script,
      userVotingPowerAt: staticVoteData.userVotingPowerAt[i]!,

      delegateAt: isZeroAddress(dynamicVoteData.delegateAt[i]!) ? null : dynamicVoteData.delegateAt[i]!,
      delegateState: dynamicVoteData.delegateState[i] as VoterState,
      voterState: dynamicVoteData.voterState[i] as VoterState,
      executed: dynamicVoteData.executed[i]!,
      yea: dynamicVoteData.yea[i]!,
      nay: dynamicVoteData.nay[i]!,

      decodedEvmScript,
    };
  };

  return Promise.all(range(validStartVoteProposals.length).map(composeProposal));
};
