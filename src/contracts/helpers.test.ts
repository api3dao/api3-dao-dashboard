import { BigNumber } from '@ethersproject/bignumber';
import {
  calculateApy,
  calculateAnnualMintedTokens,
  calculateAnnualInflationRate,
  convertPercentage,
  absoluteStakeTarget,
  HUNDRED_PERCENT,
  totalStakedPercentage,
} from './helpers';

describe('calculateAnnualInflationRate and friends', () => {
  describe('individual functions', () => {
    // Values are based on https://github.com/api3dao/api3-web-client/issues/2#issuecomment-831891578
    const currentApr = BigNumber.from(75_000_000);
    const totalStake = BigNumber.from(50_000_000);
    const totalSupply = BigNumber.from(100_000_000);

    test('calculate APY', () => {
      expect(calculateApy(currentApr).toString()).toBe('110.5689140647936519');
    });

    test('calculateAnnualMintedTokens', () => {
      const apy = calculateApy(currentApr);
      expect(calculateAnnualMintedTokens(totalStake, apy).toString()).toBe('55284457');
    });

    test('calculateAnnualInflationRate', () => {
      const apy = calculateApy(currentApr);
      const mintedTokens = calculateAnnualMintedTokens(totalStake, apy);
      expect(calculateAnnualInflationRate(mintedTokens, totalSupply).toString()).toBe('35.6020544928073516');
    });
  });

  test('low total staked', () => {
    const currentApr = BigNumber.from(75_000_000);
    const totalStake = BigNumber.from('10000000000000000001');
    const totalSupply = BigNumber.from('100000000000000000000000000');

    expect(
      calculateAnnualInflationRate(
        calculateAnnualMintedTokens(totalStake, calculateApy(currentApr)),
        totalSupply
      ).toString()
    ).toBe('0.0000110568901839');
  });

  test('full stake pool', () => {
    const currentApr = BigNumber.from(75_000_000);
    const totalSupply = BigNumber.from('100000000000000000000000000');
    const totalStake = totalSupply;

    expect(
      calculateAnnualInflationRate(
        calculateAnnualMintedTokens(totalStake, calculateApy(currentApr)),
        totalSupply
      ).toString()
    ).toBe('52.5096092915076526');
  });

  test('overfilled stake pool', () => {
    const currentApr = BigNumber.from(75_000_000);
    const totalSupply = BigNumber.from('100000000000000000000000000');
    const totalStake = totalSupply.mul(2);

    expect(
      calculateAnnualInflationRate(
        calculateAnnualMintedTokens(totalStake, calculateApy(currentApr)),
        totalSupply
      ).toString()
    ).toBe('68.8607223314571805');
  });
});

test('convertPercentage', () => {
  expect(convertPercentage(BigNumber.from(75_000_000)).toString()).toBe('0.75');
  expect(convertPercentage(BigNumber.from(0)).toString()).toBe('0.0');
  expect(convertPercentage(BigNumber.from(100_000_000)).toString()).toBe('1.0');

  expect(convertPercentage(BigNumber.from(75_000_000), true).toString()).toBe('75.0');
});

test('absoluteStakeTarget', () => {
  const totalSupply = BigNumber.from(10_000_000_000_000); // intentionally low for better understandability
  expect(absoluteStakeTarget(HUNDRED_PERCENT.div(2), totalSupply)).toEqual(totalSupply.div(2));
  expect(absoluteStakeTarget(BigNumber.from(1), totalSupply).toString()).toBe('100000');
});

test('totalStakedPercentage', () => {
  const totalSupply = BigNumber.from(10_000_000_000_000); // intentionally low for better understandability
  const stakeTarget = absoluteStakeTarget(HUNDRED_PERCENT.div(2), totalSupply);
  const totalStaked1 = stakeTarget.div(5); // 1/5 = 20% staked
  const totalStaked2 = stakeTarget; // 100% staked
  const totalStaked3 = stakeTarget.div(100); // 1% staked
  const totalStaked4 = BigNumber.from(0); // 0% staked

  expect(totalStakedPercentage(totalStaked1, stakeTarget)).toBe('20.0');
  expect(totalStakedPercentage(totalStaked2, stakeTarget)).toBe('100.0');
  expect(totalStakedPercentage(totalStaked3, stakeTarget)).toBe('1.0');
  expect(totalStakedPercentage(totalStaked4, stakeTarget)).toBe('0.0');
});
