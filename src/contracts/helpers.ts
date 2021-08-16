import { BigNumber, constants } from 'ethers';

export const min = (first: BigNumber, ...others: BigNumber[]) =>
  others.reduce((min, n) => (min.lt(n) ? min : n), first);

export const max = (first: BigNumber, ...others: BigNumber[]) =>
  others.reduce((max, n) => (max.gt(n) ? max : n), first);

// NOTE: Used to make sure BigNumber.div will not lose too much precision. Bigger value means more precision.
const precision = 100_000_000;

// based on https://docs.google.com/document/d/1ESEkemgFOhP5_tXajhuy5Mozdm8EwU1O2YSKSBwnrUQ/edit#
export const calculateApy = (apr: BigNumber) => {
  // We don't need precision for this calculation, so doing with JS numbers is enough
  const aprFloatingPoint = apr.mul(precision).div(HUNDRED_PERCENT).toNumber() / precision / 52;
  return (Math.pow(1 + aprFloatingPoint, 52) - 1) * 100;
};

// based on https://docs.google.com/document/d/1ESEkemgFOhP5_tXajhuy5Mozdm8EwU1O2YSKSBwnrUQ/edit#
export const calculateAnnualMintedTokens = (totalStake: BigNumber, currentApy: number) =>
  totalStake.mul(Math.round(currentApy * precision)).div(100 * precision);

// based on https://docs.google.com/document/d/1ESEkemgFOhP5_tXajhuy5Mozdm8EwU1O2YSKSBwnrUQ/edit#
export const calculateAnnualTotalSupplyGrowth = (annualMintedTokens: BigNumber, totalSupply: BigNumber) => {
  return (annualMintedTokens.mul(precision).div(totalSupply).toNumber() / precision) * 100;
};

// See: https://github.com/api3dao/api3-dao/blob/1dc0cfd219addcded295e0ae246461eaf6fae6e8/packages/pool/contracts/StateUtils.sol#L68
export const HUNDRED_PERCENT = BigNumber.from(10).pow(18);

/**
 * Staking target is in percentages, where HUNDRED_PERCENT is the maximum value.
 * The absolute stake target is percentage of total token supply.
 */
export const absoluteStakeTarget = (stakeTargetPercentages: BigNumber, totalSupply: BigNumber) =>
  totalSupply.mul(stakeTargetPercentages).div(HUNDRED_PERCENT);

/**
 * Compute the percentage of total stakes in the pool rounding to 1 decimal place.
 * The absoluteStakeTarget is the stake target value in tokens.
 */
export const totalStakedPercentage = (totalStaked: BigNumber, absoluteStakeTarget: BigNumber) =>
  (totalStaked.mul(precision).div(absoluteStakeTarget).toNumber() / precision) * 100;

export const MAX_ALLOWANCE = BigNumber.from(2).pow(256).sub(1);

export const computePercentage = (value: BigNumber, hundredPercent: BigNumber, humanReadable = false) => {
  const percentage = value.mul(precision).div(hundredPercent).toNumber() / precision;
  if (humanReadable) return percentage * 100;
  else return percentage;
};

export const isZeroAddress = (address: string) => address === constants.AddressZero;

// Hardcoded constant defined in https://github.com/api3dao/api3-dao/blob/develop/packages/pool/contracts/StateUtils.sol#L50
export const EPOCH_LENGTH = 7 * 24 * 60 * 60;
