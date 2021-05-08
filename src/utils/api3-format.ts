import { ethers } from 'ethers';

// API3 Token has the same denomination as ETH.
export const formatApi3 = ethers.utils.formatEther;

// API3 Token has the same denomination as ETH.
export const parseApi3 = ethers.utils.parseEther;
