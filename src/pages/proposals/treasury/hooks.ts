import { utils, BigNumberish } from 'ethers';
import { useChainData } from '../../../chain-data';

export interface FormattedTreasury {
  name: string;
  amountAndSymbol: string;
}

export interface Treasuries {
  primary: FormattedTreasury[];
  secondary: FormattedTreasury[];
}

const formatTreasuryAmount = (amount: BigNumberish, decimals: number, symbol: string) =>
  `${utils.formatUnits(amount, decimals)} ${symbol}`;

export const useTreasuries = (): Treasuries => {
  const { proposalState } = useChainData();
  if (!proposalState) return { primary: [], secondary: [] };

  return {
    primary: proposalState.treasury.map(({ name, balanceOfPrimaryAgent, symbol, decimal }) => ({
      name: name,
      amountAndSymbol: formatTreasuryAmount(balanceOfPrimaryAgent, decimal, symbol),
    })),
    secondary: proposalState.treasury.map(({ name, balanceOfSecondaryAgent, symbol, decimal }) => ({
      name: name,
      amountAndSymbol: formatTreasuryAmount(balanceOfSecondaryAgent, decimal, symbol),
    })),
  };
};
