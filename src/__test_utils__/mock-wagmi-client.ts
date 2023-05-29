/**
 * Note: https://github.com/tmm/testing-wagmi/tree/main/test was used as the starting point for this code
 */
import { createClient, CreateClientConfig } from 'wagmi';
import { MockConnector } from 'wagmi/dist/connectors/mock';
import { hardhat } from 'wagmi/chains';
import { providers, Wallet } from 'ethers';

type Config = Partial<CreateClientConfig> & { signer?: WalletSigner };

export function createMockClient({ signer = getSigners()[0]!, ...config }: Config = {}) {
  return createClient({
    connectors: [new MockConnector({ options: { signer } })],
    provider: () => getHardhatProvider(),
    ...config,
  });
}

function getHardhatProvider() {
  const rpcUrl = hardhat.rpcUrls.default.http[0];
  return new providers.StaticJsonRpcProvider(rpcUrl, {
    chainId: hardhat.id,
    name: hardhat.name,
    ensAddress: '0x00000000000C2E074eC69A0dFb2997BA6C7d2e1e',
  });
}

function getSigners() {
  const provider = getHardhatProvider();
  return accounts.map((acc) => new WalletSigner(acc.privateKey, provider));
}

class WalletSigner extends Wallet {
  connectUnchecked(): providers.JsonRpcSigner {
    return (this.provider as providers.StaticJsonRpcProvider).getUncheckedSigner(this.address);
  }
}

// Default Hardhat accounts
const accounts = [
  {
    // Account #0: 0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266
    privateKey: '0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80',
    balance: '10000000000000000000000',
  },
  {
    // Account #1: 0x70997970C51812dc3A010C7d01b50e0d17dc79C8
    privateKey: '0x59c6995e998f97a5a0044966f0945389dc9e86dae88c7a8412f4603b6b78690d',
    balance: '10000000000000000000000',
  },
];
