import orderBy from 'lodash/orderBy';

export function sortEvents<T extends { blockNumber: number; logIndex: number }>(
  events: readonly T[],
  type: 'asc' | 'desc' = 'asc'
) {
  return orderBy(
    events,
    [
      (ev) => ev.blockNumber,
      // If events are in the same block, then we sort by their log index
      (ev) => ev.logIndex,
    ],
    [type, type]
  );
}
