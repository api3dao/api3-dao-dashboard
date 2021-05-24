import { BigNumber, FixedNumber } from 'ethers';
import {
  blockTimestampToDate,
  fixedToBigNumber,
  floorStrToBigNumber,
  formatApi3,
  min,
  parseApi3,
} from './bignum-utils';

test('blockTimestampToDate', () => {
  const timestamp = BigNumber.from('1234567890');
  expect(blockTimestampToDate(timestamp)).toEqual(new Date('2009-02-13T23:31:30.000Z'));
});

test('formatApi3', () => {
  expect(parseApi3('10').toString()).toBe('10000000000000000000');
  expect(parseApi3('0.00012345').toString()).toBe('123450000000000');
});

test('parseApi3', () => {
  expect(formatApi3('10000000000000000000').toString()).toBe('10.0');
  expect(formatApi3('12345000000').toString()).toBe('0.000000012345');
  expect(() => formatApi3('abc')).toThrowError();
});

test('min', () => {
  const a = BigNumber.from(100);
  const b = BigNumber.from(200);
  const c = BigNumber.from(300);
  expect(min(b, a, c).toString()).toBe('100');
  expect(min(c, b).toString()).toBe('200');
});

describe('fixedToBigNumber', () => {
  test('rounds down', () => {
    const fixed = FixedNumber.from('100.23');
    expect(fixedToBigNumber(fixed)).toEqual(BigNumber.from('100'));
  });

  test('rounds up', () => {
    const fixed = FixedNumber.from('100.50');
    expect(fixedToBigNumber(fixed)).toEqual(BigNumber.from('101'));
  });
});

describe('floorStrToBigNumber', () => {
  test('rounds down only', () => {
    expect(floorStrToBigNumber('100.23')).toEqual(BigNumber.from('100'));
    expect(floorStrToBigNumber('100.99')).toEqual(BigNumber.from('100'));
  });
});
