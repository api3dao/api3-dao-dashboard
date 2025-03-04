import { filterAlphanumerical, getDays, getHours, getMinutes, getSeconds } from './generic';

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
