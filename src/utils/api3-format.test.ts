import { formatApi3, parseApi3, formatAndRoundApi3, round } from './api3-format';

test('parseApi3', () => {
  expect(parseApi3('10').toString()).toBe('10000000000000000000');
  expect(parseApi3('0.00012345').toString()).toBe('123450000000000');
});

test('formatAndRoundApi3', () => {
  expect(formatAndRoundApi3('10000000000000000000')).toBe('10.00');
  expect(formatAndRoundApi3('11100000000000000000')).toBe('11.10');
  expect(formatAndRoundApi3('12345000000000000000')).toBe('12.35');
  expect(formatAndRoundApi3('12345000000000000000', 3)).toBe('12.345');
  expect(formatAndRoundApi3('12345600000000000000', 3)).toBe('12.346');
  expect(formatAndRoundApi3('12345200000000000000', 3)).toBe('12.345');
});

test('formatApi3', () => {
  expect(formatApi3('10000000000000000000').toString()).toBe('10.0');
  expect(formatApi3('12345000000').toString()).toBe('0.000000012345');
  expect(() => formatApi3('abc')).toThrowError('invalid BigNumber string');
});

test('round', () => {
  expect(round(55.15616541)).toBe('55.16');
  expect(round('55.15616541')).toBe('55.16');
  expect(round(55.15616541, 3)).toBe('55.156');
  expect(round('55.15616541', 3)).toBe('55.156');
  expect(round(0)).toBe('0.00');
});
