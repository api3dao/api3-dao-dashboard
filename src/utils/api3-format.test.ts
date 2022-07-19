import {
  parseEther,
  parseApi3,
  parseUsd,
  formatEther,
  formatApi3,
  formatUsd,
  formatAndRoundApi3,
  round,
} from './api3-format';

test('parseEther', () => {
  expect(parseEther('10').toString()).toBe('10000000000000000000');
  expect(parseEther('0.00012345').toString()).toBe('123450000000000');
});

test('parseApi3', () => {
  expect(parseApi3).toBe(parseEther);
});

test('parseUsd', () => {
  expect(parseUsd).toBe(parseEther);
});

test('formatAndRoundApi3', () => {
  expect(formatAndRoundApi3('10000000000000000000')).toBe('10.0');
  expect(formatAndRoundApi3('11100000000000000000')).toBe('11.1');
  expect(formatAndRoundApi3('12345000000000000000')).toBe('12.35');
  expect(formatAndRoundApi3('12345000000000000000', 3)).toBe('12.345');
  expect(formatAndRoundApi3('12345600000000000000', 3)).toBe('12.346');
  expect(formatAndRoundApi3('12345200000000000000', 3)).toBe('12.345');
  expect(formatAndRoundApi3('1234567891234567890000000000')).toBe('1,234,567,891.23');
});

test('formatEther', () => {
  expect(formatEther('10000000000000000000').toString()).toBe('10.0');
  expect(formatEther('12345000000').toString()).toBe('0.000000012345');
  expect(() => formatEther('abc')).toThrowError('invalid BigNumber string');
  expect(formatEther('1234567890000000000000000000')).toBe('1,234,567,890.0');
  expect(formatEther('1234567890000000000000000000', false)).toBe('1234567890.0');
});

test('formatApi3', () => {
  expect(formatApi3).toBe(formatEther);
});

test('formatUsd', () => {
  expect(formatUsd).toBe(formatEther);
});

test('round', () => {
  expect(round(55.15616541)).toBe('55.16');
  expect(round('55.15616541')).toBe('55.16');
  expect(round(55.15616541, 3)).toBe('55.156');
  expect(round('55.15616541', 3)).toBe('55.156');
  expect(round(0)).toBe('0.00');
});
