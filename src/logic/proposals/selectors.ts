import { Proposal, ProposalState, ProposalType } from '../../chain-data';
import { computePercentage } from '../../contracts';

export const voteSliderSelector = (proposal: Proposal) => {
  const minAcceptanceQuorum = proposal.minAcceptQuorum.toNumber();
  const forPercentage = computePercentage(proposal.yea, proposal.votingPower);
  const againstPercentage = computePercentage(proposal.nay, proposal.votingPower);

  return {
    minAcceptanceQuorum,
    forPercentage,
    againstPercentage,
    // NOTE: We rely on proposal.supportRequired to be 50% because we don't expect it to change
    // See: https://api3workspace.slack.com/archives/C020RCCC3EJ/p1621103766015200
    status: forPercentage > againstPercentage && forPercentage > minAcceptanceQuorum ? 'passing' : 'failing',
  };
};

export const proposalDetailsSelector = (proposalState: ProposalState | null, type: ProposalType, id: string) => {
  if (!proposalState) return null;

  const proposal = proposalState[type].proposals.find((p) => p.voteId.toString() === id);
  return proposal ?? null;
};
