import { utils, BigNumberish } from 'ethers';

const DEFAULT_DECIMALS = 2;

// API3 Token has the same denomination as ETH.
export const formatApi3 = utils.formatEther;

export const formatAndRoundApi3 = (tokens: BigNumberish, decimals = DEFAULT_DECIMALS) => {
  const formatted = formatApi3(tokens);
  // NOTE: The number of tokens is formatted be ethers first so it will fit into JS number
  return Number.parseFloat(formatted).toFixed(decimals);
};

// API3 Token has the same denomination as ETH.
export const parseApi3 = utils.parseEther;

export const round = (value: number | string, decimals = DEFAULT_DECIMALS) => {
  const strValue = value.toString();
  return Number.parseFloat(strValue).toFixed(decimals);
};
