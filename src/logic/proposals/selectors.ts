import { addSeconds, differenceInDays, isAfter } from 'date-fns';
import type { BigNumber, providers } from 'ethers';

import type { DashboardState, Delegation, Proposal, Proposals, ProposalType } from '../../chain-data';
import { computePercentage, EPOCH_LENGTH, HUNDRED_PERCENT } from '../../contracts';

export type ProposalStatus = 'Execute' | 'Executed' | 'Failing' | 'Passing' | 'Rejected';
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
      return proposal.executed ? 'Executed' : 'Execute';
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

export const proposalDetailsSelector = (
  provider: providers.Provider | null,
  proposals: Proposals | null,
  type: ProposalType,
  id: BigNumber
) => {
  if (!provider) return 'user not signed in';
  if (!proposals) return 'does not exist';

  const proposal = proposals[type][id.toString()];
  return proposal ?? 'does not exist';
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
    .sort((p1, p2) => (p1.startDateRaw.gt(p2.startDateRaw) ? -1 : 1));
};

export type OptionalProposalType = ProposalType | null;
export const historyProposalsSelector = (proposals: Proposals | null, type: OptionalProposalType) => {
  if (!proposals) return;

  const primaryProposals = Object.values(proposals.primary);
  const secondaryProposals = Object.values(proposals.secondary);

  let allProposals: Proposal[];
  switch (type) {
    case 'primary': {
      allProposals = primaryProposals;

      break;
    }
    case 'secondary': {
      allProposals = secondaryProposals;

      break;
    }
    case 'none': {
      allProposals = [];

      break;
    }
    default: {
      allProposals = [...primaryProposals, ...secondaryProposals];
    }
  }

  return allProposals.filter((p) => !p.open).sort((p1, p2) => (p1.startDateRaw.gt(p2.startDateRaw) ? -1 : 1));
};

export const delegationCooldownOverSelector = (delegation: Delegation | null) => {
  if (!delegation) return false;

  const now = new Date();
  return isAfter(now, addSeconds(delegation.lastDelegationUpdateTimestamp, EPOCH_LENGTH));
};

export const proposalCooldownOverSelector = (delegation: Delegation | null) => {
  if (!delegation) return false;

  const now = new Date();
  return isAfter(now, addSeconds(delegation.lastProposalTimestamp, EPOCH_LENGTH));
};

export const canDelegateSelector = (delegation: Delegation | null, dashboardState: DashboardState | null) => {
  if (!delegation || !dashboardState) return;

  const delegationCooldownOver = delegationCooldownOverSelector(delegation);
  const hasStakedTokens = dashboardState?.userStaked.gt(0) ?? false;
  return { delegationCooldownOver, hasStakedTokens };
};

export const canUndelegateSelector = (delegation: Delegation | null) => {
  if (!delegation) return;
  const delegationCooldownOver = delegationCooldownOverSelector(delegation);
  return { delegationCooldownOver };
};

export const canCreateNewProposalSelector = (
  delegation: Delegation | null,
  dashboardState: DashboardState | null,
  isGenesisEpoch: boolean | undefined
) => {
  if (!delegation || !dashboardState) return;

  const genesisEpochOver = genesisEpochOverSelector(isGenesisEpoch);

  const lastProposalEpochOver = proposalCooldownOverSelector(delegation);
  const hasEnoughVotingPower = delegation.userVotingPower.gte(
    dashboardState.totalShares.mul(delegation.proposalVotingPowerThreshold).div(HUNDRED_PERCENT)
  );

  const totalVotingPowerPercentage = computePercentage(delegation.userVotingPower, dashboardState.totalShares, true);
  const delegatedVotingPowerPercentage = delegation.delegatedVotingPower.gt(0)
    ? computePercentage(delegation.delegatedVotingPower, dashboardState.totalShares, true)
    : null;

  return {
    lastProposalEpochOver,
    hasEnoughVotingPower,
    genesisEpochOver,
    totalVotingPowerPercentage,
    delegatedVotingPowerPercentage,
    lastProposalDeltaInDays: differenceInDays(Date.now(), delegation.lastProposalTimestamp),
  };
};

export const genesisEpochOverSelector = (isGenesisEpoch: boolean | undefined) => {
  if (isGenesisEpoch === undefined) return false;
  return !isGenesisEpoch;
};

export const canVoteSelector = (proposal: Proposal) => {
  return {
    isOpen: proposal.open,
    hasEnoughVotingPower: proposal.userVotingPowerAt.gt(0),
    isNotDelegated: !proposal.delegateAt,
  };
};

export const votingPowerThresholdSelector = (delegation: Delegation | null) => {
  if (!delegation) return null;
  return delegation.proposalVotingPowerThreshold.mul(100);
};
