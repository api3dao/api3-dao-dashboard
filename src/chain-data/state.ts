import { BigNumber, ethers, Signer } from 'ethers';
import type ContractsAddresses from '../contract-deployments/localhost-dao.json';

export interface PendingUnstake {
  amount: string;
  deadline: Date;
  scheduledFor: Date;
}

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
  targetSignature: string;
  description: string;
}

export const VOTER_STATES = { 0: 'Unvoted', 1: 'Voted For', 2: 'Voted Against' } as const;
export type VoterState = 0 | 1 | 2; // Absent, Yea, Nay
export type ProposalType = 'primary' | 'secondary';
export type TreasuryType = 'primary' | 'secondary';

export interface DecodedEvmScript {
  targetAddress: string;
  parameters: unknown[];
  value: BigNumber; // amount of ETH that is sent to the contract
}
export interface Proposal {
  voteId: ethers.BigNumber;
  creator: string;
  creatorName: string | null;
  metadata: ProposalMetadata;
  startDate: Date;
  voterState: VoterState;
  delegateAt: string | null;
  delegateState: VoterState;
  open: boolean;
  executed: boolean;
  supportRequired: number;
  minAcceptQuorum: number;
  yea: BigNumber;
  nay: BigNumber;
  votingPower: BigNumber;
  deadline: Date;
  startDateRaw: BigNumber;
  type: ProposalType;
  script: string;
  userVotingPowerAt: BigNumber;
  // can be null if there was an error when decoding the proposal (proposal created outside DAO dashboard)
  decodedEvmScript: DecodedEvmScript | null;
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

export type ProposalDictionary = { [voteId: string]: Proposal };

export interface Proposals {
  primary: ProposalDictionary;
  secondary: ProposalDictionary;
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
  | 'appeal-claim-decision';

interface Vesting {
  amountVested: BigNumber;
  remainingToWithdraw: BigNumber;
}

export interface Claim {
  claimId: string;
  evidence: string;
  timestamp: Date;
  claimant: string;
  beneficiary: string;
  claimAmountInUsd: BigNumber;
  counterOfferAmountInUsd: null | BigNumber;
  status: ClaimStatus;
  statusUpdatedAt: Date;
  deadline: null | Date;
  transactionHash: null | string;
  dispute: null | {
    id: string;
    status: DisputeStatus;
    ruling: ArbitratorRuling;
    period: DisputePeriod;
    periodEndDate: null | Date; // The last period (execution) does not have an end date
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
export type ClaimStatus = typeof ClaimStatuses[ClaimStatusCode];

export const DisputeStatuses = {
  0: 'Waiting',
  1: 'Appealable',
  2: 'Solved',
} as const;
export type DisputeStatusCode = keyof typeof DisputeStatuses;
export type DisputeStatus = typeof DisputeStatuses[DisputeStatusCode];

export const ArbitratorRulings = {
  0: 'DoNotPay',
  1: 'PayClaim',
  2: 'PaySettlement',
} as const;
export type ArbitratorRulingCode = keyof typeof ArbitratorRulings;
export type ArbitratorRuling = typeof ArbitratorRulings[ArbitratorRulingCode];

export const DisputePeriods = {
  0: 'Evidence',
  1: 'Commit',
  2: 'Vote',
  3: 'Appeal',
  4: 'Execution',
} as const;
export type DisputePeriodCode = keyof typeof DisputePeriods;
export type DisputePeriod = typeof DisputePeriods[DisputePeriodCode];

// Represents a policy that may or may not have its dynamic data loaded
export interface BasePolicy {
  policyId: string;
  claimant: string;
  beneficiary: string;
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
  // TODO: move the following fields to a separate interface called GenericChainData
  provider: ethers.providers.Web3Provider | null;
  userAccount: string;
  userAccountName: string | null;
  availableAccounts: string[]; // NOTE: Contains multiple values only when connected to hardhat node
  signer: Signer | null;
  networkName: string;
  chainId: undefined | number;
  contracts: typeof ContractsAddresses | null;

  dashboardState: DashboardState | null;
  isGenesisEpoch: boolean | undefined;
  proposals: Proposals | null;
  treasuries: Treasury[];
  delegation: Delegation | null;
  transactions: { type: TransactionType; tx: ethers.ContractTransaction }[];
  vesting: Vesting | null;
  claims: {
    userClaimIds: null | string[]; // All the claim ids that are linked to the user's account
    byId: null | { [claimId: string]: Claim };
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
  provider: null,
  userAccount: '',
  userAccountName: null,
  availableAccounts: [],
  signer: null,
  networkName: '',
  chainId: undefined,
  contracts: null,
  dashboardState: null,
  isGenesisEpoch: undefined,
  proposals: null,
  treasuries: [],
  delegation: null,
  transactions: [],
  vesting: null,
  claims: {
    userClaimIds: null,
    byId: null,
  },
  policies: {
    userPolicyIds: null,
    byId: null,
    remainingCoverageById: null,
  },
};

export const initialSettableChainData: SettableChainData = { ...initialChainData, setChainData: () => {} };
