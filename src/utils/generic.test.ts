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

  const fiveDays = 1000 * 60 * 60 * 24 * 5.672_839;
  expect(getDays(fiveDays)).toBe('05');
});

test('getHours', () => {
  const sixHours = 1000 * 60 * 60 * 6;
  expect(getHours(sixHours)).toBe('06');

  const fiveHours = 1000 * 60 * 60 * 5.672_839;
  expect(getHours(fiveHours)).toBe('05');
});

test('getMinutes', () => {
  const twentyMinutes = 1000 * 60 * 20;
  expect(getMinutes(twentyMinutes)).toBe('20');

  const thirtyThreeMinutes = 1000 * 60 * 33.215_859_3;
  expect(getMinutes(thirtyThreeMinutes)).toBe('33');
});

test('getSeconds', () => {
  const fortySeconds = 1000 * 40;
  expect(getSeconds(fortySeconds)).toBe('40');

  const twentySeconds = 1000 * 20.984_72;
  expect(getSeconds(twentySeconds)).toBe('20');
});

test('filterAlphanumerical', () => {
  expect(filterAlphanumerical('\\test\\Red\\Bob-%./"FredNew')).toBe('testRedBobFredNew');
  expect(filterAlphanumerical('')).toBe('');
  expect(filterAlphanumerical(' \t\n')).toBe('');
});

test('insertInBetween', () => {
  const array = [1, 2, 3];
  const joinLike: (number | string)[] = insertInBetween(array, '|'); // Returns Array<string | number>
  expect(joinLike).toStrictEqual([1, '|', 2, '|', 3]);

  const joinLikeFn: (number | string)[] = insertInBetween(array, () => '|'); // Returns Array<string | number>
  expect(joinLikeFn).toStrictEqual([1, '|', 2, '|', 3]);

  expect(insertInBetween([], '|')).toStrictEqual([]);
  expect(insertInBetween([1], '|')).toStrictEqual([1]);
  expect(insertInBetween([1, 2], undefined)).toStrictEqual([1, undefined, 2]);
});

test('isErrorReportingAllowed', () => {
  expect(isErrorReportingAllowed(null)).toBe(false);
  expect(isErrorReportingAllowed('random-value')).toBe(false);
  expect(isErrorReportingAllowed('false')).toBe(false);

  expect(isErrorReportingAllowed('true')).toBe(true);
});
