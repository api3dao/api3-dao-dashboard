import { BigNumber } from 'ethers';
import { decodeProposalTypeAndVoteId, encodeProposalTypeAndVoteId } from './proposal-id';

test('encoding', () => {
  expect(encodeProposalTypeAndVoteId('primary', '123')).toBe('primary-123');
});

test('decoding', () => {
  expect(decodeProposalTypeAndVoteId('primary-123')).toEqual({ voteId: BigNumber.from(123), type: 'primary' });
});

test('decoding invalid value', () => {
  expect(decodeProposalTypeAndVoteId('invalid-23notgood')).toBe(null);
  expect(decodeProposalTypeAndVoteId('primary-1-5')).toBe(null);
  expect(decodeProposalTypeAndVoteId('secondary-23notgood')).toBe(null);
  expect(decodeProposalTypeAndVoteId('primary-23-randomjunk')).toBe(null);
});
