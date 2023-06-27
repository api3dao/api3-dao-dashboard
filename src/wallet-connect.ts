import { configureChains, createClient } from 'wagmi';
import { EthereumClient, w3mConnectors } from '@web3modal/ethereum';
import { jsonRpcProvider } from '@wagmi/core/providers/jsonRpc';
import { mainnet, hardhat } from 'wagmi/chains';

if (!process.env.REACT_APP_PROJECT_ID) {
  throw new Error('Missing REACT_APP_PROJECT_ID env variable');
}

export const projectId = process.env.REACT_APP_PROJECT_ID;

const chains = [mainnet, hardhat];

const { provider } = configureChains(chains, [
  // In the web3modal docs they use their "w3mProvider", which prefers using their RPC proxy for a set number of chains,
  // and falls back to using a "jsonRpcProvider" (like below). It is unclear what the use of the RPC proxy is, and it seems
  // like a central point of failure, so we rather go with a "jsonRpcProvider" and use the RPC providers directly.
  // See: https://docs.walletconnect.com/2.0/web3modal/react/installation
  // See: https://github.com/WalletConnect/web3modal/blob/V2/chains/ethereum/src/utils.ts
  jsonRpcProvider({
    rpc: (chain) => {
      return {
        http: chain.rpcUrls.default.http[0]!,
        webSocket: chain.rpcUrls.default.webSocket?.[0],
      };
    },
  }),
]);

export const wagmiClient = createClient({
  autoConnect: false,
  connectors: w3mConnectors({ version: 2, chains, projectId }),
  provider,
});

export const ethereumClient = new EthereumClient(wagmiClient, chains);
