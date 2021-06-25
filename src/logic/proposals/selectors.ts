import { DashboardState, Delegation, Proposal, Proposals, ProposalType, VOTER_STATES } from '../../chain-data';
import { computePercentage, EPOCH_LENGTH } from '../../contracts';
import { addSeconds, isAfter } from 'date-fns';
import { HUNDRED_PERCENT } from '../../contracts';
import { BigNumber } from 'ethers';

export type ProposalStatus = 'Passing' | 'Failing' | 'Executed' | 'Execute' | 'Rejected';
export const voteSliderSelector = (proposal: Proposal) => {
  const minAcceptanceQuorum = proposal.minAcceptQuorum;
  const forPercentage = computePercentage(proposal.yea, proposal.votingPower, true);
  const againstPercentage = computePercentage(proposal.nay, proposal.votingPower, true);

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

  const wasDelegated = proposal.delegateAt !== null;
  const voterState = wasDelegated ? proposal.delegateState : proposal.voterState;

  return {
    minAcceptanceQuorum,
    forPercentage,
    againstPercentage,
    wasDelegated,
    voterState,
    proposalStatus: computeProposalStatus(),
    open: proposal.open,
  };
};

export const proposalDetailsSelector = (proposals: Proposals | null, type: ProposalType, id: BigNumber) => {
  if (!proposals) return null;

  const proposal = proposals[type][id.toString()];
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
  if (!proposals) return;

  const primaryProposals = Object.values(proposals.primary);
  const secondaryProposals = Object.values(proposals.secondary);

  return [...primaryProposals, ...secondaryProposals]
    .filter((p) => p.open)
    .sort((p1, p2) => (p1.startDateRaw.lt(p2.startDateRaw) ? -1 : 1));
};

export type OptionalProposalType = ProposalType | null;
export const historyProposalsSelector = (proposals: Proposals | null, type: OptionalProposalType) => {
  if (!proposals) return;

  const primaryProposals = Object.values(proposals.primary);
  const secondaryProposals = Object.values(proposals.secondary);

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

export const delegationCooldownOverSelector = (delegation: Delegation | null) => {
  // Make the buttons disabled until delegation is loaded
  if (!delegation) return false;

  const now = new Date();
  return isAfter(now, addSeconds(delegation.lastDelegationUpdateTimestamp, EPOCH_LENGTH));
};

export const canCreateNewProposalSelector = (delegation: Delegation | null, dashboardState: DashboardState | null) => {
  if (!delegation || !dashboardState) return false;

  const now = new Date();
  const epochOver = isAfter(now, addSeconds(delegation.lastProposalTimestamp, EPOCH_LENGTH));
  const hasEnoughVotingPower = delegation.userVotingPower.gte(
    dashboardState.totalShares.mul(delegation.proposalVotingPowerThreshold).div(HUNDRED_PERCENT)
  );

  return epochOver && hasEnoughVotingPower;
};

export const canVoteSelector = (proposal: Proposal) => {
  return (
    proposal.open &&
    proposal.userVotingPowerAt.gt(0) &&
    !proposal.delegateAt &&
    VOTER_STATES[proposal.voterState] === 'Unvoted'
  );
};
