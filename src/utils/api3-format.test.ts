import { formatApi3, parseApi3 } from './api3-format';

test('formatApi3', () => {
  expect(parseApi3('10').toString()).toBe('10000000000000000000');
  expect(parseApi3('0.00012345').toString()).toBe('123450000000000');
});

test('parseApi3', () => {
  expect(formatApi3('10000000000000000000').toString()).toBe('10.0');
  expect(formatApi3('12345000000').toString()).toBe('0.000000012345');
  expect(() => formatApi3('abc')).toThrowError('invalid BigNumber string');
});
