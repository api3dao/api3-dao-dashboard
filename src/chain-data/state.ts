import { BigNumber, ethers } from 'ethers';

export interface ConvenienceDashboardData {
  api3Supply: BigNumber;
  apr: BigNumber;
  stakeTarget: BigNumber;
  totalShares: BigNumber;
  totalStake: BigNumber;
  userLocked: BigNumber;
  userStaked: BigNumber;
  userUnstaked: BigNumber;
  userUnstakeAmount: BigNumber;
  userUnstakeScheduledFor: BigNumber;
  userUnstakeShares: BigNumber;
  userVesting: BigNumber;
}

export interface DashboardState extends ConvenienceDashboardData {
  allowance: BigNumber;
  userApi3Balance: BigNumber;
}

export interface ProposalMetadata {
  version: string;
  title: string;
  targetSignature: string | null;
  description: string;
}

export const VOTER_STATES = { 0: 'Unvoted', 1: 'Voted For', 2: 'Voted Against' } as const;
export type VoterState = 0 | 1 | 2; // Absent, Yea, Nay
export type ProposalType = 'primary' | 'secondary';
export type TreasuryType = 'primary' | 'secondary';

export interface Proposal extends StartVoteEventData, VoteData {
  voteId: string;
  type: ProposalType;
  open: boolean;
  // Proposals that are loaded on the list pages won't have the decoded EVM script (we defer loading it for the
  // Proposal Details page). Once loaded, it can be null if there was an error when decoding the script
  // (such a proposal would likely have been created outside the DAO dashboard)
  decodedEvmScript?: DecodedEvmScript | null;
}

export interface StartVoteEventData {
  voteId: string;
  type: ProposalType;
  metadata: ProposalMetadata;
  creator: string;
  blockNumber: number;
  logIndex: number;
}

export interface VoteData {
  voteId: string;
  script: string;
  startDate: Date;
  startDateRaw: BigNumber;
  deadline: Date;
  supportRequired: number;
  minAcceptQuorum: number;
  votingPower: BigNumber;
  userVotingPowerAt: BigNumber;
  delegateAt: string | null;
  delegateState: VoterState;
  voterState: VoterState;
  executed: boolean;
  yea: BigNumber;
  nay: BigNumber;
}

export interface DecodedEvmScript {
  targetAddress: string;
  parameters: unknown[];
  value: BigNumber; // amount of ETH that is sent to the contract
}

// Primary and secondary proposals have data stored in this shape respectively
interface ProposalState {
  voteIds: null | string[];
  openVoteIds: string[];
  startVoteEventDataById: {
    [voteId: string]: StartVoteEventData;
  };
  voteDataById: {
    [voteId: string]: VoteData;
  };
  decodedEvmScriptById: {
    [voteId: string]: DecodedEvmScript | null;
  };
}

export interface Delegation {
  proposalVotingPowerThreshold: BigNumber;
  // NOTE: userVotingPower includes delegated voting power
  userVotingPower: BigNumber;
  delegatedVotingPower: BigNumber;
  delegate: string | null;
  delegateName: string | null;
  lastDelegationUpdateTimestamp: Date;
  lastProposalTimestamp: Date;
}

export interface Treasury {
  name: string;
  symbol: string;
  decimal: number;
  balanceOfPrimaryAgent: BigNumber;
  balanceOfSecondaryAgent: BigNumber;
}

export type TransactionType =
  | 'approve-deposit'
  | 'deposit-only'
  | 'deposit-and-stake'
  | 'stake'
  | 'initiate-unstake'
  | 'unstake'
  | 'unstake-withdraw'
  | 'withdraw'
  | 'delegate'
  | 'undelegate'
  | 'new-vote'
  | 'vote-for'
  | 'vote-against'
  | 'execute'
  | 'update-timelock-status'
  | 'withdraw-to-pool'
  | 'create-claim'
  | 'accept-claim-settlement'
  | 'escalate-claim-to-arbitrator'
  | 'appeal-claim-decision'
  | 'execute-claim-payout';

interface Vesting {
  amountVested: BigNumber;
  remainingToWithdraw: BigNumber;
}

export interface Claim {
  claimId: string;
  evidence: string;
  timestamp: Date;
  claimant: string;
  claimAmountInUsd: BigNumber;
  settlementAmountInUsd: null | BigNumber;
  status: ClaimStatus;
  statusUpdatedAt: Date;
  deadline: null | Date;
  transactionHash: null | string;
  dispute: null | {
    id: string;
    status: DisputeStatus;
    ruling: ArbitratorRuling;
    period: DisputePeriod;
    periodChangedAt: Date;
    periodTimes: {
      evidence: number;
      vote: number;
      appeal: number;
    };
    appealedBy: null | string;
  };
  policy: { id: string; metadata: string };
}

export const ClaimStatuses = {
  0: 'None',
  1: 'ClaimCreated',
  2: 'ClaimAccepted',
  3: 'SettlementProposed',
  4: 'SettlementAccepted',
  5: 'DisputeCreated',
  6: 'DisputeResolvedWithoutPayout',
  7: 'DisputeResolvedWithClaimPayout',
  8: 'DisputeResolvedWithSettlementPayout',
} as const;
export type ClaimStatusCode = keyof typeof ClaimStatuses;
export type ClaimStatus = (typeof ClaimStatuses)[ClaimStatusCode];

export const DisputeStatuses = {
  0: 'Waiting',
  1: 'Appealable',
  2: 'Solved',
} as const;
export type DisputeStatusCode = keyof typeof DisputeStatuses;
export type DisputeStatus = (typeof DisputeStatuses)[DisputeStatusCode];

export const ArbitratorRulings = {
  0: 'DoNotPay',
  1: 'PayClaim',
  2: 'PaySettlement',
} as const;
export type ArbitratorRulingCode = keyof typeof ArbitratorRulings;
export type ArbitratorRuling = (typeof ArbitratorRulings)[ArbitratorRulingCode];

export const DisputePeriods = {
  0: 'Evidence',
  1: 'Commit',
  2: 'Vote',
  3: 'Appeal',
  4: 'Execution',
} as const;
export type DisputePeriodCode = keyof typeof DisputePeriods;
export type DisputePeriod = (typeof DisputePeriods)[DisputePeriodCode];

export interface ClaimPayout {
  amountInUsd: BigNumber;
  amountInApi3: BigNumber;
  transactionHash: string;
}

// Represents a policy that may or may not have its dynamic data loaded
export interface BasePolicy {
  policyId: string;
  claimant: string;
  claimsAllowedFrom: Date;
  claimsAllowedUntil: Date;
  ipfsHash: string;
  metadata: string;
  // Dynamic data
  remainingCoverageInUsd?: BigNumber;
}

export interface Policy extends BasePolicy {
  remainingCoverageInUsd: BigNumber;
}

export interface ChainData {
  dashboardState: DashboardState | null;
  isGenesisEpoch: boolean | undefined;
  proposals: {
    primary: ProposalState;
    secondary: ProposalState;
  };
  treasuries: Treasury[];
  delegation: Delegation | null;
  transactions: { type: TransactionType; tx: ethers.ContractTransaction }[];
  vesting: Vesting | null;
  claims: {
    userClaimIds: null | string[]; // All the claim ids that are linked to the user's account
    byId: null | { [claimId: string]: Claim };
    payoutById: null | { [claimId: string]: ClaimPayout };
  };
  policies: {
    userPolicyIds: null | string[]; // All the policy ids that are linked to the user's account
    byId: null | { [policyId: string]: Omit<Policy, 'remainingCoverageInUsd'> };
    remainingCoverageById: null | { [policyId: string]: BigNumber };
  };
}

export interface SettableChainData extends ChainData {
  setChainData: (
    reason: string,
    newChainData: Partial<ChainData> | ((chainData: ChainData) => Partial<ChainData>)
  ) => void;
}

export const initialChainData: ChainData = {
  dashboardState: null,
  isGenesisEpoch: undefined,
  treasuries: [],
  delegation: null,
  transactions: [],
  vesting: null,
  claims: {
    userClaimIds: null,
    byId: null,
    payoutById: null,
  },
  policies: {
    userPolicyIds: null,
    byId: null,
    remainingCoverageById: null,
  },
  proposals: {
    primary: {
      voteIds: null,
      openVoteIds: [],
      startVoteEventDataById: {},
      voteDataById: {},
      decodedEvmScriptById: {},
    },
    secondary: {
      voteIds: null,
      openVoteIds: [],
      startVoteEventDataById: {},
      voteDataById: {},
      decodedEvmScriptById: {},
    },
  },
};

export const initialSettableChainData: SettableChainData = { ...initialChainData, setChainData: () => {} };
