import { PendingTransactionMessages, TransactionType } from '../chain-data';

export const messages = {
  // Dashboard errors
  FAILED_TO_LOAD_DASHBOARD_DATA: 'Failed to load latest dashboard data',

  // Transaction messages
  TX_APPROVAL_REJECTED: 'API3 token approval transaction rejected',
  TX_APPROVAL_ERROR: 'Failed to approve API3 token allowance. Please try again',
  TX_DEPOSIT_REJECTED: 'API3 token deposit transaction rejected',
  TX_DEPOSIT_ERROR: 'Failed to deposit API3 tokens. Please try again',
  TX_GENERIC_REJECTED: 'Transaction rejected',
  TX_GENERIC_ERROR: 'An error has occurred. Please try again',

  // Validation messages
  VALIDATION_INPUT_ZERO: 'Please ensure you have entered a positive, non-zero amount',
  VALIDATION_INPUT_PARSE: 'Unable to parse input amount',
  VALIDATION_DEPOSIT_TOO_HIGH: 'Deposit value cannot be higher than the available balance',
  VALIDATION_INPUT_TOO_HIGH: 'Input amount cannot be higher than the available balance',

  // Blockchain errors
  FAILED_TO_LOAD_CHAIN_DATA: 'Unable to load blockchain data',
  FAILED_TO_LOAD_TREASURY_AND_DELEGATION: 'Unable to load delegation and treasury data',

  // Delegation errors
  UNABLE_TO_LOAD_DELEGATE: 'Unable to load the delagate of address',
  INVALID_DELEGATE_ADDRESS: 'Delegation target must be a valid non zero address',
  DELEGATE_IS_YOURSELF: "You can't delegate to yourself",
  REDELEGATION_IS_FORBIDDEN: (targetDelegate: string) => `Address ${targetDelegate} delegates to some other account`,

  // Proposals errors
  FAILED_TO_LOAD_PROPOSALS: 'Unable to load proposals',
  FAILED_TO_LOAD_GENESIS_EPOCH: 'Unable to load the current epoch',
  INVALID_PROPOSAL_FORMAT: 'This proposal was not created through the DAO dashboard and cannot to be displayed',
  PROPOSAL_NOT_FOUND: `Proposal not found`,
};

// TODO: these messages should change depending on the final designs
export const transactionMessages: { [key in TransactionType]: PendingTransactionMessages } = {
  'approve-deposit': {
    start: 'Approving API3 token allowance...',
    success: 'API3 token allowance approved!',
    error: 'API3 token allowance failed',
  },
  'deposit-only': {
    start: 'Depositing API3 tokens...',
    success: 'API3 tokens deposited successfully!',
    error: 'API3 token deposit failed',
  },
  'deposit-and-stake': {
    start: 'Depositing and staking API3 tokens...',
    success: 'API3 tokens deposited and staked successfully!',
    error: 'API3 token deposit and stake failed',
  },
  stake: {
    start: 'Staking API3 tokens...',
    success: 'API3 tokens staked successfully!',
    error: 'API3 token stake failed',
  },
  'initiate-unstake': {
    start: 'Initiating API3 token unstake...',
    success: 'API3 token unstake initiated successfully!',
    error: 'API3 token unstake initiation failed',
  },
  unstake: {
    start: 'Unstaking API3 tokens...',
    success: 'API3 tokens unstaked successfully!',
    error: 'API3 token unstake failed',
  },
  'unstake-withdraw': {
    start: 'Unstaking and withdrawing API3 tokens...',
    success: 'API3 tokens unstaked and withdrawn successfully!',
    error: 'API3 token unstake and withdraw failed',
  },
  withdraw: {
    start: 'Withdrawing API3 tokens...',
    success: 'API3 tokens withdrawn successfully!',
    error: 'API3 token withdraw failed',
  },
  delegate: {
    start: 'Delegating voting power...',
    success: 'Voting power delegated successfully!',
    error: 'Voting power delegation failed',
  },
  undelegate: {
    start: 'Undelegating voting power...',
    success: 'Voting power undelegated successfully!',
    error: 'Voting power undelegation failed',
  },
  'new-vote': {
    start: 'Submitting new proposal...',
    success: 'New proposal submitted successfully!',
    error: 'New proposal submission failed',
  },
  'vote-for': {
    start: 'Voting for proposal...',
    success: 'Vote for proposal cast successfully!',
    error: 'Vote for proposal failed',
  },
  'vote-against': {
    start: 'Voting against proposal...',
    success: 'Vote against proposal cast successfully!',
    error: 'Vote against proposal failed',
  },
  execute: {
    start: 'Executing proposal...',
    success: 'Successfully executed proposal!',
    error: 'Proposal execution failed',
  },
};
