import { BigNumber } from '@ethersproject/bignumber';

// based on https://github.com/api3dao/api3-web-client/issues/2#issuecomment-831891578
export const calculateApy = (apr: BigNumber) => BigNumber.from(1).add(apr.div(100000000).div(52)).pow(52).sub(1);
