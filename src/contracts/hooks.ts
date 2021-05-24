import { useMemo } from 'react';
import { useChainData } from '../chain-data';
import {
  Api3Pool__factory as Api3PoolFactory,
  Api3Token__factory as Api3TokenFactory,
  Api3Voting__factory as Api3VotingFactory,
} from '../generated-contracts';

export const useApi3Pool = () => {
  const { provider, contracts } = useChainData();

  return useMemo(() => {
    if (!provider || !contracts) return null;
    return Api3PoolFactory.connect(contracts.api3Pool, provider.getSigner());
  }, [provider, contracts]);
};

export const useApi3Token = () => {
  const { provider, contracts } = useChainData();

  return useMemo(() => {
    if (!provider || !contracts) return null;
    return Api3TokenFactory.connect(contracts.api3Token, provider.getSigner());
  }, [provider, contracts]);
};

export const useApi3Voting = () => {
  const { provider, contracts } = useChainData();

  return useMemo(() => {
    if (!provider || !contracts) return null;
    return {
      primary: Api3VotingFactory.connect(contracts.votingAppPrimary, provider.getSigner()),
      secondary: Api3VotingFactory.connect(contracts.votingAppSecondary, provider.getSigner()),
    };
  }, [provider, contracts]);
};

export interface Api3Agent {
  primary: string;
  secondary: string;
}

export const useApi3AgentAddresses = (): Api3Agent | null => {
  const { contracts } = useChainData();

  return useMemo(() => {
    if (!contracts) return null;
    return {
      primary: contracts.agentAppPrimary,
      secondary: contracts.agentAppSecondary,
    };
  }, [contracts]);
};
