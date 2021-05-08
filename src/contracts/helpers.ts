import { BigNumber, FixedNumber } from '@ethersproject/bignumber';
import range from 'lodash/range';

// TODO: this API is awful, create a bit nicer wrapper around this

const toBigNumber = (fixed: FixedNumber) => BigNumber.from(fixed.round().toString().split('.')[0]);

// based on https://github.com/api3dao/api3-web-client/issues/2#issuecomment-831891578
export const calculateApy = (apr: BigNumber) => {
  const base = FixedNumber.from(1).addUnsafe(
    FixedNumber.from(apr.toString()).divUnsafe(FixedNumber.from(100000000)).divUnsafe(FixedNumber.from(52))
  );
  let apy = FixedNumber.from(1);
  range(52).forEach(() => {
    apy = apy.mulUnsafe(base);
  });
  return apy.subUnsafe(FixedNumber.from(1)).mulUnsafe(FixedNumber.from(100));
};

export const calculateAnnualMintedTokens = (totalStake: BigNumber, currentApy: FixedNumber) =>
  toBigNumber(FixedNumber.from(totalStake).mulUnsafe(currentApy).divUnsafe(FixedNumber.from(100)));

export const calculateAnnualInflationRate = (annualMintedTokens: BigNumber, totalSupply: BigNumber) => {
  const annualMintedTokensBn = FixedNumber.from(annualMintedTokens);
  return annualMintedTokensBn
    .divUnsafe(annualMintedTokensBn.addUnsafe(FixedNumber.from(totalSupply)))
    .mulUnsafe(FixedNumber.from(100));
};
