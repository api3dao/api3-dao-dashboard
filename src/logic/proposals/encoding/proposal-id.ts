import { BigNumber } from 'ethers';
import { ProposalType } from '../../../chain-data';
import { goSync, isGoSuccess } from '../../../utils';

/**
 * Proposal is uniquely referenced by id, which is a combination of proposal type and its vote id. This function
 * receives proposal type and vote id and returns single unique id identifying the proposal.
 *
 * @param type either "primary" or "secondary"
 * @param voteId the vote id of the proposal
 */
export const encodeProposalTypeAndVoteId = (type: ProposalType, voteId: string) => `${type}-${voteId}`;

const isValidProposalType = (type: string | undefined): type is ProposalType =>
  type === 'primary' || type === 'secondary';

/**
 * Validates and decomposes the encoded proposal id and returns its type and vote id. Note that this function only
 * checks the shape of the encoded id and not whether such proposal really exist (it may not be created yet).
 *
 * @param typeAndVoteId the encoded proposal id
 */
export const decodeProposalTypeAndVoteId = (typeAndVoteId: string) => {
  const [type, voteId, ...rest] = typeAndVoteId.split('-');

  if (rest.length !== 0) return null;
  if (!isValidProposalType(type)) return null;
  if (!isGoSuccess(goSync(() => BigNumber.from(voteId)))) return null;

  return { type: type, voteId: BigNumber.from(voteId) };
};
