import { utils, BigNumberish } from 'ethers';

const DEFAULT_DECIMALS = 2;

// API3 Token has the same denomination as ETH.
export const formatApi3 = (value: BigNumberish, commify = true) => {
  const formatted = utils.formatEther(value);
  return commify ? utils.commify(formatted) : formatted;
};

// USD amounts have the same denomination as API3.
export const formatUsd = formatApi3;

export const formatAndRoundApi3 = (tokens: BigNumberish, decimals = DEFAULT_DECIMALS) => {
  const formatted = utils.formatEther(tokens);
  // NOTE: The number of tokens is formatted by ethers first so it will fit into JS number
  // Also, ethers.commify will strip unnecessary zero decimals from end. For example, 12.00 becomes 12.0
  return utils.commify(Number.parseFloat(formatted).toFixed(decimals));
};

// API3 Token has the same denomination as ETH.
export const parseApi3 = utils.parseEther;

// USD amounts have the same denomination as ETH.
export const parseUsd = utils.parseEther;

export const round = (value: number | string, decimals = DEFAULT_DECIMALS) => {
  const strValue = value.toString();
  return Number.parseFloat(strValue).toFixed(decimals);
};
