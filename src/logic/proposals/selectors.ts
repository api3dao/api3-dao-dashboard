import { Proposal, Proposals, ProposalType } from '../../chain-data';
import { computePercentage } from '../../contracts';

export type ProposalStatus = 'Passing' | 'Failing' | 'Executed' | 'Execute' | 'Rejected';
export const voteSliderSelector = (proposal: Proposal) => {
  const minAcceptanceQuorum = proposal.minAcceptQuorum.toNumber();
  const forPercentage = computePercentage(proposal.yea, proposal.votingPower);
  const againstPercentage = computePercentage(proposal.nay, proposal.votingPower);

  const computeProposalStatus = (): ProposalStatus => {
    // NOTE: We rely on proposal.supportRequired to be 50% because we don't expect it to change
    // See: https://api3workspace.slack.com/archives/C020RCCC3EJ/p1621103766015200
    const isPassing = forPercentage > againstPercentage && forPercentage > minAcceptanceQuorum;

    if (proposal.open) {
      return isPassing ? 'Passing' : 'Failing';
    }

    if (isPassing) {
      if (proposal.executed) return 'Executed';
      else return 'Execute';
    } else {
      return 'Rejected';
    }
  };

  return {
    minAcceptanceQuorum,
    forPercentage,
    againstPercentage,
    voterState: proposal.voterState,
    proposalStatus: computeProposalStatus(),
    open: proposal.open,
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

export const openProposalsSelector = (proposals: Proposals | null) => {
  const primaryProposals = Object.values(proposals?.primary || {});
  const secondaryProposals = Object.values(proposals?.secondary || {});

  return [...primaryProposals, ...secondaryProposals]
    .filter((p) => p.open)
    .sort((p1, p2) => (p1.startDateRaw.lt(p2.startDateRaw) ? -1 : 1));
};

export type OptionalProposalType = ProposalType | null;
export const historyProposalsSelector = (proposals: Proposals | null, type: OptionalProposalType) => {
  const primaryProposals = Object.values(proposals?.primary || {});
  const secondaryProposals = Object.values(proposals?.secondary || {});

  let allProposals: Proposal[];
  if (type === 'primary') {
    allProposals = primaryProposals;
  } else if (type === 'secondary') {
    allProposals = secondaryProposals;
  } else {
    allProposals = [...primaryProposals, ...secondaryProposals];
  }

  return allProposals.filter((p) => !p.open).sort((p1, p2) => (p1.startDateRaw.lt(p2.startDateRaw) ? -1 : 1));
};
