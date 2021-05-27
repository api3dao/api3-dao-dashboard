import { BigNumber, ethers } from 'ethers';
import type ContractsAddresses from '../contract-deployments/localhost-dao.json';

export interface PendingUnstake {
  amount: string;
  deadline: Date;
  scheduledFor: Date;
}

export interface DashboardState {
  allowance: BigNumber;
  annualApy: number;
  annualInflationRate: number;
  balance: BigNumber;
  ownedTokens: BigNumber;
  pendingUnstake: PendingUnstake | null;
  stakeTarget: BigNumber;
  totalStaked: BigNumber;
  totalStakedPercentage: number;
  userStake: BigNumber;
  withdrawable: BigNumber;
}

export interface ProposalMetadata {
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
}

export interface Delegation {
  delegate: string | null;
  mostRecentProposalTimestamp: Date;
  mostRecentVoteTimestamp: Date;
  mostRecentDelegationTimestamp: Date;
  mostRecentUndelegationTimestam: Date;
}

export interface Treasury {
  name: string;
  symbol: string;
  decimal: number;
  balanceOfPrimaryAgent: BigNumber;
  balanceOfSecondaryAgent: BigNumber;
}

export interface ProposalState {
  delegation: Delegation;
  treasury: Treasury[];
  // TODO: It makes more sense to have the state like this:
  // "{activeProposals: {primary: Proposal[], secondary: Proposal[]}}"
  primary: {
    proposals: Proposal[];
  };
  secondary: {
    proposals: Proposal[];
  };
}

export interface ChainData {
  provider: ethers.providers.Web3Provider | null;
  userAccount: string;
  networkName: string;
  contracts: typeof ContractsAddresses | null;
  dashboardState: DashboardState | null;
  proposalState: ProposalState | null;
  transactions: ethers.ContractTransaction[];
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
  proposalState: null,
  transactions: [],
};

export const initialSettableChainData: SettableChainData = { ...initialChainData, setChainData: () => {} };
