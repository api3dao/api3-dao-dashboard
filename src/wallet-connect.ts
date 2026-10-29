import { createWeb3Modal } from '@web3modal/wagmi/react';
import { EIP6963Connector } from '@web3modal/wagmi';
import { configureChains, createConfig } from 'wagmi';
import { mainnet, hardhat } from 'wagmi/chains';
import { jsonRpcProvider } from 'wagmi/providers/jsonRpc';

import { CoinbaseWalletConnector } from 'wagmi/connectors/coinbaseWallet';
import { InjectedConnector } from 'wagmi/connectors/injected';
import { WalletConnectConnector } from 'wagmi/connectors/walletConnect';

const projectId = import.meta.env.VITE_PROJECT_ID;
const mainnetProviderUrl = import.meta.env.VITE_MAINNET_PROVIDER_URL;

if (!projectId) {
  throw new Error('Missing VITE_PROJECT_ID env variable');
}

if (!mainnetProviderUrl) {
  throw new Error('Missing VITE_MAINNET_PROVIDER_URL env variable');
}

export { projectId };

const chainInfos = [
  { chain: mainnet, rpcUrl: mainnetProviderUrl },
  { chain: hardhat, rpcUrl: 'http://localhost:8545' },
];

// The metadata is used by WalletConnect to display the app information in the user Wallet.
const metadata = {
  name: 'Api3 DAO',
  description: 'Decentralized APIs for Web 3.0', // Taken from Api3 whitepaper.
  url: window.location.origin, // The URL is deployment specific.
  icons: ['https://avatars.githubusercontent.com/u/69474416'], // Taken from Api3 GitHub. The icon is a bit cut, but still looks good. Using the page favicon (window.location.origin + '/favicon.ico') does not work.
};

const { chains, publicClient } = configureChains(
  chainInfos.map(({ chain }) => chain),
  // In wagmi docs, they suggest using multiple provider configurations. See:
  // https://wagmi.sh/react/providers/configuring-chains#multiple-rpc-providers.
  //
  // Based on our testing this doesn't work. When the mainnet public RPC provider (Cloudflare ETH) was down, using the
  // multiple provider configurations still trigger errors suggesting the fallback mechanism is not implemented
  // properly. To avoid depending on this behaviour, we use a fixed RPC URL provider configuration that is set by us.
  [
    jsonRpcProvider({
      rpc: (chain) => {
        const chainInfo = chainInfos.find(({ chain: { id } }) => chain.id === id)!;
        return {
          http: chainInfo.rpcUrl,
        };
      },
    }),
  ]
);

// We are using a "createConfig" from "wagmi" instead of "defaultWagmiConfig" from "@web3modal/wagmi/react" because it
// does not support "autoConnect: false" option and it ignores RPC urls set by ourselves (and uses the public ones).
export const wagmiConfig = createConfig({
  autoConnect: false,
  connectors: [
    new WalletConnectConnector({ chains, options: { projectId, showQrModal: false, metadata } }),
    new EIP6963Connector({ chains }),
    new InjectedConnector({ chains, options: { shimDisconnect: true } }),
    new CoinbaseWalletConnector({ chains, options: { appName: metadata.name } }),
  ],
  publicClient,
});

// Creates the Web3Modal instance that can be used to connect to a wallet. Must be called outside of React component.
// See: https://docs.walletconnect.com/web3modal/react/about
export const registerWeb3Modal = () => createWeb3Modal({ wagmiConfig, projectId, chains, themeMode: 'light' });
