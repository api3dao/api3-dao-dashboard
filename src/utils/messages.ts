import { PendingTransactionMessages, TransactionType } from '../chain-data';

export const messages = {
  // Transaction messages
  TX_APPROVAL_REJECTED: 'API3 token approval transaction rejected.',
  TX_APPROVAL_ERROR: 'Failed to approve API3 token allowance. Please try again.',
  TX_DEPOSIT_REJECTED: 'API3 token deposit transaction rejected.',
  TX_DEPOSIT_ERROR: 'Failed to deposit API3 tokens. Please try again.',
  TX_GENERIC_REJECTED: 'Transaction rejected.',
  TX_GENERIC_ERROR: 'An error has occurred. Please try again.',

  // Validation messages
  VALIDATION_INPUT_ZERO: 'Please enter a value greater than 0.',
  VALIDATION_INPUT_PARSE: 'Failed to parse input amount.',
  VALIDATION_DEPOSIT_TOO_HIGH: 'Value too large. Please enter a value equal to or less than your available balance.',
  VALIDATION_INPUT_TOO_HIGH: 'Value too large. Please enter a value equal to or less than your available balance.',

  // Blockchain errors
  FAILED_TO_LOAD_CHAIN_DATA: 'Failed to load blockchain data. Please try again later.',
  FAILED_TO_LOAD_TREASURY_AND_DELEGATION: 'Failed to load delegation and treasury data. Please try again later.',

  // Delegation errors
  FAILED_TO_LOAD_DELEGATE:
    'Failed to verify that the intended delegate address is not already delegated. Please try again later.',
  INVALID_DELEGATE_ADDRESS: 'Please delegate to a valid, non-zero address.',
  DELEGATE_IS_YOURSELF: 'Voting power cannot be delegated to your connected address.',
  REDELEGATION_IS_FORBIDDEN: (targetDelegate: string) =>
    `Failed to delegate to address ${targetDelegate} because it is currently delegated to a different address.`,

  // Proposals errors
  FAILED_TO_LOAD_PROPOSALS: 'Failed to load proposals. Please try again later.',
  FAILED_TO_LOAD_GENESIS_EPOCH: 'Failed to load the current epoch.',
  INVALID_PROPOSAL_FORMAT: 'This proposal was not created through the DAO dashboard and cannot to be displayed.',
  PROPOSAL_NOT_FOUND: 'Proposal not found.',

  // Vesting errors
  FAILED_TO_LOAD_VESTING_DATA: 'Failed to load vesting data. Please try again later.',
};

// TODO: these messages should change depending on the final designs
export const transactionMessages: { [key in TransactionType]: PendingTransactionMessages } = {
  'approve-deposit': {
    start: 'Approving API3 token allowance...',
    success: 'Success! API3 token allowance approved.',
    error: 'API3 token allowance failed.',
  },
  'deposit-only': {
    start: 'Depositing API3 tokens...',
    success: 'Success! API3 tokens deposited.',
    error: 'Failed to deposit API3 tokens. Please try again.',
  },
  'deposit-and-stake': {
    start: 'Depositing and staking API3 tokens...',
    success: 'Success! API3 tokens deposited and staked.',
    error: 'Failed to deposit and stake API3 tokens. Please try again.',
  },
  stake: {
    start: 'Staking API3 tokens...',
    success: 'Success! API3 tokens staked.',
    error: 'Failed to stake API3 tokens. Please try again.',
  },
  'initiate-unstake': {
    start: 'Initiating unstaking of API3 tokens...',
    success: 'Success! Initiated unstaking of API3 tokens.',
    error: 'Failed to initiate unstaking of API3 tokens. Please try again.',
  },
  unstake: {
    start: 'Unstaking API3 tokens...',
    success: 'Success! API3 tokens unstaked.',
    error: 'Failed to unstake API3 tokens. Please try again.',
  },
  'unstake-withdraw': {
    start: 'Unstaking and withdrawing API3 tokens...',
    success: 'Success! API3 tokens unstaked and withdrawn.',
    error: 'Failed to unstake and withdraw API3 tokens. Please try again.',
  },
  withdraw: {
    start: 'Withdrawing API3 tokens...',
    success: 'Success! API3 tokens withdrawn.',
    error: 'Failed to withdraw API3 tokens. Please try again.',
  },
  delegate: {
    start: 'Delegating voting power...',
    success: 'Success! Voting power delegated.',
    error: 'Failed to delegate voting power. Please try again.',
  },
  undelegate: {
    start: 'Undelegating voting power...',
    success: 'Success! Voting power undelegated.',
    error: 'Failed to undelegate voting power. Please try again.',
  },
  'new-vote': {
    start: 'Submitting new proposal...',
    success: 'Success! New proposal submitted.',
    error: 'Failed to submit new proposal. Please try again.',
  },
  'vote-for': {
    start: 'Casting vote “For” proposal...',
    success: 'Success! Vote “For” has been cast.',
    error: 'Failed to cast vote “For”. Please try again.',
  },
  'vote-against': {
    start: 'Casting vote “Against” proposal...',
    success: 'Success! Vote “Against” has been cast.',
    error: 'Failed to cast vote “Against”. Please try again.',
  },
  execute: {
    start: 'Executing proposal...',
    success: 'Success! Proposal executed.',
    error: 'Failed to execute proposal. Please try again.',
  },
  'update-timelock-status': {
    start: 'Updating timelock status...',
    success: 'Success! Timelock status updated.',
    error: 'Failed to update timelock status. Please try again.',
  },
  'withdraw-to-pool': {
    start: 'Withdrawing to pool...',
    success: 'Success! API3 tokens withdrawn to pool.',
    error: 'Failed to withdraw to pool. Please try again.',
  },
};
