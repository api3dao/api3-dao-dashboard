import { ethers } from 'ethers';
import WalletConnectProvider from '@walletconnect/web3-provider';
import Web3Modal from 'web3modal';
import localhostDao from './contract-deployments/localhost-dao.json';
import ropstenDao from './contract-deployments/ropsten-dao.json';
import { initialChainData, useChainData } from './chain-data';
import Button from './components/button/button';

const daoNetworks = [localhostDao, ropstenDao] as any[]; // silence TS strict mode

const WalletConnectDemo = () => {
  const { setChainData, provider, ...data } = useChainData();

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

      const newData = {
        userAccount: await provider.getSigner().getAddress(),
        networkName: await (await provider.getNetwork()).name,
        chainId: await (await provider.getNetwork()).chainId.toString(),
      };
      if (newData.networkName === 'unknown') newData.networkName = 'localhost';

      setChainData({ ...newData, provider });
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
    setChainData(initialChainData);
  };

  let contractsData = 'Unsupported chain!';
  const current = data && daoNetworks.find(({ chainId }) => chainId === data.chainId);
  if (current) {
    contractsData = JSON.stringify(
      Object.entries(current.contracts).map(([k, v]) => ({
        name: k,
        address: (v as any).address,
      }))
    );
  }

  return (
    <>
      {!provider && <Button onClick={onWalletConnect}>Wallet connect</Button>}
      {provider && <Button onClick={onDisconnect}>Disconnect</Button>}

      {provider && <p>{JSON.stringify(data)}</p>}
      {provider && <p>{contractsData}</p>}
      {false && (
        <button onClick={() => setChainData({ ...data, provider, networkName: data.networkName + 'a' })}>
          Set chain data
        </button>
      )}
    </>
  );
};

export default WalletConnectDemo;
