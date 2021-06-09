export const messages = {
  // Transaction messages
  TX_APPROVAL_REJECTED: 'API3 token approval transaction rejected',
  TX_APPROVAL_ERROR: 'Failed to approve API3 token allowance. Please try again',
  TX_DEPOSIT_REJECTED: 'API3 token deposit transaction rejected',
  TX_DEPOSIT_ERROR: 'Failed to deposit API3 tokens. Please try again',
  TX_GENERIC_REJECTED: 'Transaction rejected',
  TX_GENERIC_ERROR: 'An error has occurred. Please try again',

  // Validation messages
  VALIDATION_INPUT_ZERO: 'Please ensure you have entered a non-zero amount',
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
};
