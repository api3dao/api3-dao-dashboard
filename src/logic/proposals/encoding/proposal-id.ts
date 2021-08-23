import { BigNumber } from 'ethers';
import { ProposalType } from '../../../chain-data';
import { goSync, isGoSuccess } from '../../../utils';

export const encodeProposalTypeAndId = (type: ProposalType, voteId: string) => `${type}-${voteId}`;

const isValidProposalType = (type: string | undefined): type is ProposalType =>
  type === 'primary' || type === 'secondary';

export const decodeProposalTypeAndId = (typeAndId: string) => {
  const [type, voteId, ...rest] = typeAndId.split('-');

  if (rest.length !== 0) return null;
  if (!isValidProposalType(type)) return null;
  if (!isGoSuccess(goSync(() => BigNumber.from(voteId)))) return null;

  return { type: type, voteId: BigNumber.from(voteId) };
};
