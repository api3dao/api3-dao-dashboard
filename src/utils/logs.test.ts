import { sortEvents } from './logs';

describe('sortEvents()', () => {
  it('sorts by both block number and log index', () => {
    const events = [
      { testId: 'G', blockNumber: 4, logIndex: 0 },
      { testId: 'E', blockNumber: 2, logIndex: 3 },
      { testId: 'A', blockNumber: 0, logIndex: 0 },
      { testId: 'D', blockNumber: 2, logIndex: 2 },
      { testId: 'F', blockNumber: 3, logIndex: 0 },
      { testId: 'C', blockNumber: 2, logIndex: 1 },
      { testId: 'B', blockNumber: 1, logIndex: 0 },
    ];

    const result = sortEvents(events);

    expect(result).toEqual([
      { testId: 'A', blockNumber: 0, logIndex: 0 },
      { testId: 'B', blockNumber: 1, logIndex: 0 },
      { testId: 'C', blockNumber: 2, logIndex: 1 },
      { testId: 'D', blockNumber: 2, logIndex: 2 },
      { testId: 'E', blockNumber: 2, logIndex: 3 },
      { testId: 'F', blockNumber: 3, logIndex: 0 },
      { testId: 'G', blockNumber: 4, logIndex: 0 },
    ]);
    expect(result === events).toBe(false); // sortEvents is immutable
  });
});
