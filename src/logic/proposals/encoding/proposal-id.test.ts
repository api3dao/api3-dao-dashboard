import { BigNumber } from 'ethers';
import { decodeProposalTypeAndId, encodeProposalTypeAndId } from './proposal-id';

test('encoding', () => {
  expect(encodeProposalTypeAndId('primary', '123')).toBe('primary-123');
});

test('decoding', () => {
  expect(decodeProposalTypeAndId('primary-123')).toEqual({ voteId: BigNumber.from(123), type: 'primary' });
});

test('decoding invalid value', () => {
  expect(decodeProposalTypeAndId('invalid-23notgood')).toBe(null);
  expect(decodeProposalTypeAndId('primary-1-5')).toBe(null);
  expect(decodeProposalTypeAndId('secondary-23notgood')).toBe(null);
  expect(decodeProposalTypeAndId('primary-23-randomjunk')).toBe(null);
});
