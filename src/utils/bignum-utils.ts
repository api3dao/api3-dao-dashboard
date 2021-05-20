import { ethers, BigNumber, FixedNumber } from 'ethers';

// API3 Token has the same denomination as ETH.
export const formatApi3 = ethers.utils.formatEther;

// API3 Token has the same denomination as ETH.
export const parseApi3 = ethers.utils.parseEther;

export const blockTimestampToDate = (timestamp: BigNumber) => new Date(timestamp.mul(1000).toNumber());

export const floorStrToBigNumber = (str: string) => BigNumber.from(str.split('.')[0]);

export const fixedToBigNumber = (fixed: FixedNumber) => BigNumber.from(fixed.round().toString().split('.')[0]);

export const min = (first: BigNumber, ...other: BigNumber[]) => other.reduce((min, n) => (min.lt(n) ? min : n), first);
