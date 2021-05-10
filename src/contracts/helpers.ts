import { BigNumber, FixedNumber } from '@ethersproject/bignumber';
import range from 'lodash/range';

// TODO: this API is awful, create a bit nicer wrapper around this

const toBigNumber = (fixed: FixedNumber) => BigNumber.from(fixed.round().toString().split('.')[0]);

export const min = (first: BigNumber, ...other: BigNumber[]) => other.reduce((min, n) => (min.lt(n) ? min : n), first);

// based on https://github.com/api3dao/api3-web-client/issues/2#issuecomment-831891578
export const calculateApy = (apr: BigNumber) => {
  const base = FixedNumber.from(1).addUnsafe(
    FixedNumber.from(apr.toString()).divUnsafe(FixedNumber.from(HUNDRED_PERCENT)).divUnsafe(FixedNumber.from(52))
  );
  let apy = FixedNumber.from(1);
  range(52).forEach(() => {
    apy = apy.mulUnsafe(base);
  });
  return apy.subUnsafe(FixedNumber.from(1)).mulUnsafe(FixedNumber.from(100));
};

// based on https://github.com/api3dao/api3-web-client/issues/2#issuecomment-831891578
export const calculateAnnualMintedTokens = (totalStake: BigNumber, currentApy: FixedNumber) =>
  toBigNumber(FixedNumber.from(totalStake).mulUnsafe(currentApy).divUnsafe(FixedNumber.from(100)));

// based on https://github.com/api3dao/api3-web-client/issues/2#issuecomment-831891578
export const calculateAnnualInflationRate = (annualMintedTokens: BigNumber, totalSupply: BigNumber) => {
  const annualMintedTokensFn = FixedNumber.from(annualMintedTokens);
  return annualMintedTokensFn
    .divUnsafe(annualMintedTokensFn.addUnsafe(FixedNumber.from(totalSupply)))
    .mulUnsafe(FixedNumber.from(100));
};

// See: https://github.com/api3dao/api3-dao/blob/692d148e04e70cd22969149b2a0945f763bb9425/packages/pool/contracts/StateUtils.sol#L73
// TODO: This convention will be updated before the launch by replacing 8 with 18
export const HUNDRED_PERCENT = BigNumber.from(100_000_000);

/**
 * Convert smart contract percentages to human readable percentages.
 * For example, 75_000_000 should convert to 0.75.
 * If humanReadable is true, percentage is multiplied by 100
 */
export const convertPercentage = (daoPercentage: BigNumber, humanReadable = false) => {
  const percentage = FixedNumber.from(daoPercentage).divUnsafe(FixedNumber.from(HUNDRED_PERCENT));
  if (humanReadable) return percentage.mulUnsafe(FixedNumber.from(100));
  else return percentage;
};

/**
 * Staking target is in percentages, where HUNDRED_PERCENT is the maximum value.
 * The absolute stake target is percentage of total token supply.
 */
export const absoluteStakeTarget = (stakeTargetPercentages: BigNumber, totalSupply: BigNumber) =>
  // Intentionally avoiding FixedNumber calculations
  totalSupply.mul(stakeTargetPercentages).div(HUNDRED_PERCENT);

/**
 * Compute the percentage of total stakes in the pool rounding to 1 decimal place.
 * The stakeTarget is the absolute value (not in percentages).
 */
export const totalStakedPercentage = (totalStaked: BigNumber, stakeTarget: BigNumber) =>
  FixedNumber.from(totalStaked)
    .divUnsafe(FixedNumber.from(stakeTarget))
    .mulUnsafe(FixedNumber.from(100))
    .round(1)
    .toString();
