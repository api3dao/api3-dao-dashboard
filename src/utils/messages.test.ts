import { messages } from './messages';

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
  });
});
