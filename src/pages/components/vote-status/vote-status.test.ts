import { formatVoteStatus } from './vote-status';

describe('formatVoteStatus', () => {
  it('formats correctly when delegated', () => {
    expect(formatVoteStatus(0, true)).toBe('Unvoted');
    expect(formatVoteStatus(1, true)).toBe('Voted For (by delegate)');
    expect(formatVoteStatus(2, true)).toBe('Voted Against (by delegate)');
  });

  it('formats correctly when NOT delegated', () => {
    expect(formatVoteStatus(0, false)).toBe('Unvoted');
    expect(formatVoteStatus(1, false)).toBe('Voted For');
    expect(formatVoteStatus(2, false)).toBe('Voted Against');
  });
});
