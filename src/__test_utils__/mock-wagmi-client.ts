/**
 * Note: https://github.com/tmm/testing-wagmi/tree/main/test was used as the starting point for this code
 */
import { createConfig, CreateConfigParameters, WalletClient } from 'wagmi';
import { MockConnector } from 'wagmi/dist/connectors/mock';
import { hardhat } from 'wagmi/chains';
import { createPublicClient, createWalletClient, http } from 'viem';

type Config = Partial<CreateConfigParameters> & { walletClient?: WalletClient };

export function createMockClient({ walletClient = getMockWalletClient(), ...config }: Config = {}) {
  return createConfig({
    connectors: [new MockConnector({ options: { walletClient } })],
    publicClient: () => getPublicClient(),
    ...config,
  });
}

export const getMockWalletClient = () =>
  // Default Hardhat account
  createWalletClient({
    transport: http(hardhat.rpcUrls.default.http[0]),
    chain: hardhat,
    account: '0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266',
    key: '0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80',
    pollingInterval: 100,
  });

export const getPublicClient = () => {
  return createPublicClient({
    transport: http(hardhat.rpcUrls.default.http[0]),
    chain: hardhat,
    pollingInterval: 100,
  });
};
