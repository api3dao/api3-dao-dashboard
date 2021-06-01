import { Proposal, Proposals, ProposalType } from '../../chain-data';
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

export const proposalDetailsSelector = (proposals: Proposals | null, type: ProposalType, id: string) => {
  if (!proposals) return null;

  const proposal = proposals[type][id];
  return proposal ?? null;
};

export const openProposalIdsSelector = (proposals: Proposals | null) => {
  if (!proposals) return { primary: [], secondary: [] };

  const filterActiveProposalIds = (type: ProposalType) =>
    Object.values(proposals[type])
      .filter((p) => p.open)
      .map((p) => p.voteId);

  return { primary: filterActiveProposalIds('primary'), secondary: filterActiveProposalIds('secondary') };
};
