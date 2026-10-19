import { BigNumber, ethers } from 'ethers';

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
  targetSignature: string | null;
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
/**
 * One call of an EVM script that was not created through the DAO dashboard (metadata version 3). The script is decoded
 * without knowing the ABI of the target, so the calldata is kept as is.
 */
export interface EvmScriptCall {
  // The contract that ends up being called
  targetAddress: string;
  // The agents whose `execute` function forwards the call, outermost first. Empty when the voting app calls the target
  // directly
  viaAgents: string[];
  value: BigNumber; // amount of ETH that is sent to the contract, always zero for direct calls
  data: string; // calldata of the call to the target, '0x' for a plain ETH transfer
}
export interface Proposal {
  voteId: ethers.BigNumber;
  creator: string;
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
  // the calls of a version 3 proposal, null for other versions or when the script cannot be decoded
  decodedCalls: EvmScriptCall[] | null;
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
  | 'withdraw-to-pool';

interface Vesting {
  amountVested: BigNumber;
  remainingToWithdraw: BigNumber;
}

export interface ChainData {
  dashboardState: DashboardState | null;
  isGenesisEpoch: boolean | undefined;
  proposals: Proposals | null;
  treasuries: Treasury[];
  delegation: Delegation | null;
  transactions: { type: TransactionType; tx: ethers.ContractTransaction }[];
  vesting: Vesting | null;
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
  proposals: null,
  treasuries: [],
  delegation: null,
  transactions: [],
  vesting: null,
};

export const initialSettableChainData: SettableChainData = { ...initialChainData, setChainData: () => {} };
