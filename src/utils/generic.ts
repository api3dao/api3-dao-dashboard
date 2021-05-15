import { BigNumber } from '@ethersproject/bignumber';

export const blockTimestampToDate = (timestamp: BigNumber) => new Date(timestamp.mul(1000).toNumber());
