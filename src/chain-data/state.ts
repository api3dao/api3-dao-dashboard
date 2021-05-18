import { BigNumber, ethers } from 'ethers';
import type localhostDao from '../contract-deployments/localhost-dao.json';

type ContractsInfo = typeof localhostDao['contracts'];

export interface ProposalMetadata {
  targetSignature: string;
  description: string;
}

export type VoterState = 0 | 1 | 2; // Absent, Yea, Nay

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
}

export interface ProposalState {
  delegationAddress: string;
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
  chainId: string;
  contracts: ContractsInfo | null;
  latestBlock: number;
  proposalState: ProposalState | null;
}

interface SettableChainData extends ChainData {
  setChainData: (newChainData: ChainData) => void;
}

export const initialChainData: ChainData = {
  provider: null,
  userAccount: '',
  networkName: '',
  chainId: '',
  contracts: null,
  latestBlock: 0,
  proposalState: null,
};

export const initialSettableChainData: SettableChainData = { ...initialChainData, setChainData: () => {} };
