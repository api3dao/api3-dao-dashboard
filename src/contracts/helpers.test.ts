import { BigNumber } from 'ethers';
import round from 'lodash/round';
import { formatApi3 } from '../utils/api3-format';
import {
  calculateApy,
  calculateAnnualMintedTokens,
  calculateAnnualTotalSupplyGrowth,
  absoluteStakeTarget,
  HUNDRED_PERCENT,
  totalStakedPercentage,
  min,
  max,
} from './helpers';

const createPercentage = (numerator: number, denominator: number) => HUNDRED_PERCENT.mul(numerator).div(denominator);

const API3_TOKEN_SUPPLY = BigNumber.from('100000000000000000000000000');

describe('calculateAnnualTotalSupplyGrowth and friends', () => {
  describe('individual functions', () => {
    const currentApr = createPercentage(75, 100);
    const totalStake = API3_TOKEN_SUPPLY.div(2);

    test('calculate APY', () => {
      // Precision is not important here
      expect(round(calculateApy(currentApr), 6)).toBe(110.568914);
    });

    test('calculateAnnualMintedTokens', () => {
      const apy = calculateApy(currentApr);
      expect(calculateAnnualMintedTokens(totalStake, apy).toString()).toBe('55284457030000000000000000');
      expect(formatApi3(calculateAnnualMintedTokens(totalStake, apy))).toBe('55,284,457.03');
    });

    test('calculateAnnualTotalSupplyGrowth', () => {
      const apy = calculateApy(currentApr);
      const mintedTokens = calculateAnnualMintedTokens(totalStake, apy);

      expect(calculateAnnualTotalSupplyGrowth(mintedTokens, API3_TOKEN_SUPPLY)).toBe(55.284456999999996);
    });
  });

  test('low total staked', () => {
    const currentApr = createPercentage(3, 4);
    const totalStake = API3_TOKEN_SUPPLY.div(1_000_000);

    expect(
      calculateAnnualTotalSupplyGrowth(
        calculateAnnualMintedTokens(totalStake, calculateApy(currentApr)),
        API3_TOKEN_SUPPLY
      )
    ).toBe(0.00011);
  });

  test('full stake pool', () => {
    const currentApr = createPercentage(3, 4);
    const totalStake = API3_TOKEN_SUPPLY;

    expect(
      calculateAnnualTotalSupplyGrowth(
        calculateAnnualMintedTokens(totalStake, calculateApy(currentApr)),
        API3_TOKEN_SUPPLY
      )
    ).toBe(110.56891399999999);
  });
});

test('absoluteStakeTarget', () => {
  expect(absoluteStakeTarget(HUNDRED_PERCENT.div(2), API3_TOKEN_SUPPLY)).toEqual(API3_TOKEN_SUPPLY.div(2));
});

test('totalStakedPercentage', () => {
  const stakeTarget = absoluteStakeTarget(HUNDRED_PERCENT.div(2), API3_TOKEN_SUPPLY);
  const totalStaked1 = stakeTarget.div(5); // 1/5 = 20% staked
  const totalStaked2 = stakeTarget; // 100% staked
  const totalStaked3 = stakeTarget.div(100); // 1% staked
  const totalStaked4 = BigNumber.from(0); // 0% staked

  expect(totalStakedPercentage(totalStaked1, stakeTarget)).toBe(20);
  expect(totalStakedPercentage(totalStaked2, stakeTarget)).toBe(100);
  expect(totalStakedPercentage(totalStaked3, stakeTarget)).toBe(1);
  expect(totalStakedPercentage(totalStaked4, stakeTarget)).toBe(0);
});

test('min', () => {
  const a = BigNumber.from(100);
  const b = BigNumber.from(200);
  const c = BigNumber.from(300);
  expect(min(b, a, c).toString()).toBe('100');
  expect(min(c, b).toString()).toBe('200');
});

test('max', () => {
  const a = BigNumber.from(100);
  const b = BigNumber.from(200);
  const c = BigNumber.from(300);
  expect(max(b, a, c).toString()).toBe('300');
  expect(max(a, b).toString()).toBe('200');
});
