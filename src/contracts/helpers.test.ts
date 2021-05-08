import { BigNumber } from '@ethersproject/bignumber';
import { calculateApy, calculateAnnualMintedTokens, calculateAnnualInflationRate } from './helpers';

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
