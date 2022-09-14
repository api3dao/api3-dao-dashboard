import sortBy from 'lodash/sortBy';

export function sortEvents<T extends { blockNumber: number; logIndex: number }>(events: readonly T[]) {
  return sortBy(events, [
    (ev) => ev.blockNumber,
    // If events are in the same block, then we sort by their log index
    (ev) => ev.logIndex,
  ]);
}
