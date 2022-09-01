import { paginate } from './pagination';

describe('paginate()', () => {
  it('inserts the "..." on the right side only for the first 4 pages', () => {
    expect(paginate(95, { currentPage: 1 })).toEqual([1, 2, 3, 4, 5, '...', 9, 10]);
    expect(paginate(95, { currentPage: 2 })).toEqual([1, 2, 3, 4, 5, '...', 9, 10]);
    expect(paginate(95, { currentPage: 3 })).toEqual([1, 2, 3, 4, 5, '...', 9, 10]);
    expect(paginate(95, { currentPage: 4 })).toEqual([1, 2, 3, 4, 5, '...', 9, 10]);
  });

  it('inserts the "..." on both sides when past the 4th page', () => {
    expect(paginate(95, { currentPage: 5 })).toEqual([1, '...', 4, 5, 6, '...', 10]);
    expect(paginate(95, { currentPage: 6 })).toEqual([1, '...', 5, 6, 7, '...', 10]);
  });

  it('inserts the "..." on the left side only for the last 4 pages', () => {
    expect(paginate(95, { currentPage: 7 })).toEqual([1, 2, '...', 6, 7, 8, 9, 10]);
    expect(paginate(95, { currentPage: 8 })).toEqual([1, 2, '...', 6, 7, 8, 9, 10]);
    expect(paginate(95, { currentPage: 9 })).toEqual([1, 2, '...', 6, 7, 8, 9, 10]);
    expect(paginate(95, { currentPage: 10 })).toEqual([1, 2, '...', 6, 7, 8, 9, 10]);
  });

  it('accepts a custom page size', () => {
    expect(paginate(42, { pageSize: 5, currentPage: 4 })).toEqual([1, 2, 3, 4, 5, '...', 8, 9]);
    expect(paginate(42, { pageSize: 5, currentPage: 5 })).toEqual([1, '...', 4, 5, 6, '...', 9]);
    expect(paginate(42, { pageSize: 5, currentPage: 6 })).toEqual([1, 2, '...', 5, 6, 7, 8, 9]);
  });

  it('handles when the current page is out of bounds', () => {
    expect(paginate(200, { currentPage: -1 })).toEqual([1, 2, 3, 4, 5, '...', 19, 20]);
    expect(paginate(200, { currentPage: 21 })).toEqual([1, 2, '...', 16, 17, 18, 19, 20]);
  });

  it('returns all pages when the total number of pages is small', () => {
    expect(paginate(75, { currentPage: 1 })).toEqual([1, 2, 3, 4, 5, 6, 7, 8]);
    expect(paginate(65, { currentPage: 1 })).toEqual([1, 2, 3, 4, 5, 6, 7]);
    expect(paginate(15, { currentPage: 1 })).toEqual([1, 2]);
    expect(paginate(5, { currentPage: 1 })).toEqual([1]);
  });
});
