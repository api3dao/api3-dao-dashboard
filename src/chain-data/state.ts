import { BigNumber, ethers } from 'ethers';
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
  ownedTokens: BigNumber;
}

export interface ProposalMetadata {
  version: string;
  title: string;
  targetSignature: string;
  description: string;
}

export type VoterState = 0 | 1 | 2; // Absent, Yea, Nay
export type ProposalType = 'primary' | 'secondary';

export interface Proposal {
  voteId: ethers.BigNumber;
  creator: string;
  metadata: ProposalMetadata;
  startDate: Date;
  voterState: VoterState;
  open: boolean;
  executed: boolean;
  supportRequired: BigNumber;
  minAcceptQuorum: BigNumber;
  yea: BigNumber;
  nay: BigNumber;
  votingPower: BigNumber;
  deadline: Date;
  startDateRaw: BigNumber;
  type: ProposalType;
  script: string;
}

export interface Delegation {
  delegate: string | null;
  mostRecentProposalTimestamp: Date;
  mostRecentVoteTimestamp: Date;
  mostRecentDelegationTimestamp: Date;
  mostRecentUndelegationTimestamp: Date;
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
  | 'deposit'
  | 'stake'
  | 'initiate-unstake'
  | 'unstake'
  | 'withdraw'
  | 'delegate'
  | 'undelegate'
  | 'vote-for'
  | 'vote-against';

export interface ChainData {
  provider: ethers.providers.Web3Provider | null;
  userAccount: string;
  networkName: string;
  contracts: typeof ContractsAddresses | null;
  dashboardState: DashboardState | null;
  proposals: Proposals | null;
  treasuries: Treasury[];
  delegation: Delegation | null;
  transactions: { type: TransactionType; tx: ethers.ContractTransaction }[];
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
  networkName: '',
  contracts: null,
  dashboardState: null,
  proposals: null,
  treasuries: [],
  delegation: null,
  transactions: [],
};

export const initialSettableChainData: SettableChainData = { ...initialChainData, setChainData: () => {} };
