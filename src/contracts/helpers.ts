import { BigNumber, FixedNumber } from 'ethers';
import range from 'lodash/range';
import { fixedToBigNumber } from '../utils/bignum-utils';

// TODO: this API is awful, create a bit nicer wrapper around this

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
export const calculateAnnualMintedTokens = (totalStake: BigNumber, currentApy: FixedNumber) => {
  return fixedToBigNumber(FixedNumber.from(totalStake).mulUnsafe(currentApy).divUnsafe(FixedNumber.from(100)));
};

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
export const absoluteStakeTarget = (stakeTargetPercentages: BigNumber, totalSupply: BigNumber) => {
  // Intentionally avoiding FixedNumber calculations
  return totalSupply.mul(stakeTargetPercentages).div(HUNDRED_PERCENT);
};

/**
 * Compute the percentage of total stakes in the pool rounding to 1 decimal place.
 * The stakeTarget is the absolute value (not in percentages).
 */
export const totalStakedPercentage = (totalStaked: BigNumber, stakeTarget: BigNumber) => {
  return FixedNumber.from(totalStaked)
    .divUnsafe(FixedNumber.from(stakeTarget))
    .mulUnsafe(FixedNumber.from(100))
    .round(1);
};

export const MAX_ALLOWANCE = BigNumber.from(2).pow(256).sub(1);

export const ALLOWANCE_REFILL_TRESHOLD = MAX_ALLOWANCE.div(2);
