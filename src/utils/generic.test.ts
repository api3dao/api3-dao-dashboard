import {
  filterAlphanumerical,
  getDays,
  getHours,
  getMinutes,
  getSeconds,
  insertInBetween,
  isErrorReportingAllowed,
} from './generic';

test('getDays', () => {
  const twelveDays = 1000 * 60 * 60 * 24 * 12;
  expect(getDays(twelveDays)).toBe('12');

  const fiveDays = 1000 * 60 * 60 * 24 * 5.672839;
  expect(getDays(fiveDays)).toBe('05');
});

test('getHours', () => {
  const sixHours = 1000 * 60 * 60 * 6;
  expect(getHours(sixHours)).toBe('06');

  const fiveHours = 1000 * 60 * 60 * 5.672839;
  expect(getHours(fiveHours)).toBe('05');
});

test('getMinutes', () => {
  const twentyMinutes = 1000 * 60 * 20;
  expect(getMinutes(twentyMinutes)).toBe('20');

  const thirtyThreeMinutes = 1000 * 60 * 33.2158593;
  expect(getMinutes(thirtyThreeMinutes)).toBe('33');
});

test('getSeconds', () => {
  const fortySeconds = 1000 * 40;
  expect(getSeconds(fortySeconds)).toBe('40');

  const twentySeconds = 1000 * 20.98472;
  expect(getSeconds(twentySeconds)).toBe('20');
});

test('filterAlphanumerical', () => {
  expect(filterAlphanumerical('\\test\\Red\\Bob-%./"FredNew')).toEqual('testRedBobFredNew');
  expect(filterAlphanumerical('')).toEqual('');
  expect(filterAlphanumerical(' \t\n')).toEqual('');
});

test('insertInBetween', () => {
  const array = [1, 2, 3];
  const joinLike: Array<string | number> = insertInBetween(array, '|'); // returns Array<string | number>
  expect(joinLike).toEqual([1, '|', 2, '|', 3]);

  const joinLikeFn: Array<string | number> = insertInBetween(array, () => '|'); // returns Array<string | number>
  expect(joinLikeFn).toEqual([1, '|', 2, '|', 3]);

  expect(insertInBetween([], '|')).toEqual([]);
  expect(insertInBetween([1], '|')).toEqual([1]);
  expect(insertInBetween([1, 2], undefined)).toEqual([1, undefined, 2]);
});

test('isErrorReportingAllowed', () => {
  expect(isErrorReportingAllowed(null)).toBe(false);
  expect(isErrorReportingAllowed('random-value')).toBe(false);
  expect(isErrorReportingAllowed('false')).toBe(false);

  expect(isErrorReportingAllowed('true')).toBe(true);
});
