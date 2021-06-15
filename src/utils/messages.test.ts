import { messages, transactionMessages } from './messages';

test('messages', () => {
  expect(messages).toEqual({
    LOAD_DASHBOARD_ERROR: 'Failed to load latest dashboard data',

    TX_APPROVAL_REJECTED: 'API3 token approval transaction rejected',
    TX_APPROVAL_ERROR: 'Failed to approve API3 token allowance. Please try again',
    TX_DEPOSIT_REJECTED: 'API3 token deposit transaction rejected',
    TX_DEPOSIT_ERROR: 'Failed to deposit API3 tokens. Please try again',
    TX_GENERIC_REJECTED: 'Transaction rejected',
    TX_GENERIC_ERROR: 'An error has occurred. Please try again',

    VALIDATION_INPUT_ZERO: 'Please ensure you have entered a non-zero amount',
    VALIDATION_INPUT_PARSE: 'Unable to parse input amount',
    VALIDATION_DEPOSIT_TOO_HIGH: 'Deposit value cannot be higher than the available balance',
    VALIDATION_INPUT_TOO_HIGH: 'Input amount cannot be higher than the available balance',

    FAILED_TO_LOAD_CHAIN_DATA: 'Unable to load blockchain data',
    FAILED_TO_LOAD_TREASURY_AND_DELEGATION: 'Unable to load delegation and treasury data',

    UNABLE_TO_LOAD_DELEGATE: 'Unable to load the delagate of address',
    INVALID_DELEGATE_ADDRESS: 'Delegation target must be a valid non zero address',
    DELEGATE_IS_YOURSELF: "You can't delegate to yourself",
    REDELEGATION_IS_FORBIDDEN: expect.anything(), // REDELEGATION_IS_FORBIDDEN is a function
  });
});

test('transactionMessages', () => {
  expect(transactionMessages).toEqual({
    'approve-deposit': {
      start: 'Approving API3 token allowance...',
      success: 'API3 token allowance approved!',
      error: 'API3 token allowance failed',
    },
    deposit: {
      start: 'Depositing API3 tokens...',
      success: 'API3 tokens deposited successfully!',
      error: 'API3 token deposit failed',
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
  });
});
