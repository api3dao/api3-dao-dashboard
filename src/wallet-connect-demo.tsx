import { useState } from 'react';
import { ethers } from 'ethers';
import WalletConnectProvider from '@walletconnect/web3-provider';
import Web3Modal from 'web3modal';
import localhostDao from './contract-deployments/localhost-dao.json';
import ropstenDao from './contract-deployments/ropsten-dao.json';

const daoNetworks = [localhostDao, ropstenDao] as any[]; // silence TS strict mode

const WalletConnectDemo = () => {
  const [provider, setProvider] = useState<ethers.providers.Provider | null>(null);
  const [data, setData] = useState<any>(null);

  const onWalletConnect = async () => {
    const providerOptions = {
      walletconnect: {
        package: WalletConnectProvider,
        options: {
          // TODO: use mapping function for this
          rpc: {
            3: process.env.REACT_APP_ROPSTEN_PROVIDER_URL,
            31337: 'http://127.0.0.1:8545/',
          },
        },
      },
    };

    const web3Modal = new Web3Modal({
      // If true, it the provider will be cached in local storage and there will be no modal
      // asking on re-login and the same provider will be used.
      cacheProvider: false,
      disableInjectedProvider: false,
      providerOptions, // required
    });

    const wcProvider = await web3Modal.connect();

    try {
      // Enable session (triggers QR Code modal)
      await wcProvider.enable();
    } catch {
      // TODO: handle error (e.g. user closes the modal)
      return;
    }

    const upsertData = async () => {
      const provider = new ethers.providers.Web3Provider(wcProvider);
      setProvider(provider);

      const data = { account: await provider.getSigner().getAddress(), network: await provider.getNetwork() };
      if (data.network.name === 'unknown') data.network.name = 'localhost';
      setData(data);
    };

    wcProvider.on('accountsChanged', () => {
      upsertData();
    });

    wcProvider.on('chainChanged', () => {
      upsertData();
    });

    wcProvider.on('networkChanged', () => {
      upsertData();
    });

    upsertData();
  };

  const onDisconnect = () => {
    setProvider(null);
    setData(null);
  };

  let contractsData = 'Unsupported chain!';
  const current = data && daoNetworks.find(({ chainId }) => chainId === data.network.chainId.toString());
  if (current) {
    contractsData = JSON.stringify(
      Object.entries(current.contracts).map(([k, v]) => ({
        name: k,
        address: (v as any).address,
      }))
    );
  }

  return (
    <div style={{ margin: 200 }}>
      {!provider && <button onClick={onWalletConnect}>Wallet connect</button>}
      {provider && <button onClick={onDisconnect}>Disconnect</button>}

      {data && <p>{JSON.stringify(data.network)}</p>}
      {data && <p>{JSON.stringify(data.account)}</p>}
      {data && <p>{contractsData}</p>}
    </div>
  );
};

export default WalletConnectDemo;
