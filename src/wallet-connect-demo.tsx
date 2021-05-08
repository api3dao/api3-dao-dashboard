import { ethers } from 'ethers';
import WalletConnectProvider from '@walletconnect/web3-provider';
import Web3Modal from 'web3modal';
import localhostDao from './contract-deployments/localhost-dao.json';
import ropstenDao from './contract-deployments/ropsten-dao.json';
import { initialChainData, useChainData } from './chain-data';
import Button from './components/button/button';

const daoNetworks = [localhostDao, ropstenDao];

const WalletConnectDemo = () => {
  const { setChainData, provider, ...data } = useChainData();

  const onDisconnect = () => {
    if (provider) {
      const externalProvider: any = provider.provider;
      if (typeof externalProvider.close === 'function') {
        externalProvider.close();
      }
    }

    setChainData(initialChainData);
  };

  const onWalletConnect = async () => {
    const web3Modal = new Web3Modal({
      // If true, it the provider will be cached in local storage and there will be no modal
      // asking on re-login and the same provider will be used.
      cacheProvider: false,
      disableInjectedProvider: false,
      providerOptions: {
        walletconnect: {
          package: WalletConnectProvider,
          options: {
            // This is actually the default value in WalletConnectProvider, but I'd rather be explicit about this
            bridge: 'https://bridge.walletconnect.org',
            // TODO: use mapping function for this
            rpc: {
              3: process.env.REACT_APP_ROPSTEN_PROVIDER_URL,
              31337: 'http://127.0.0.1:8545/',
            },
          },
        },
      },
    });

    const web3ModalProvider = await web3Modal.connect();
    const upsertData = async () => {
      const provider = new ethers.providers.Web3Provider(web3ModalProvider);
      const networkChainId = await (await provider.getNetwork()).chainId.toString();

      const daoNetwork = daoNetworks.find(({ chainId }) => chainId === networkChainId);

      const newData = {
        userAccount: await provider.getSigner().getAddress(),
        networkName: await (await provider.getNetwork()).name,
        chainId: networkChainId,
        contracts: daoNetwork?.contracts ?? null,
      };
      if (newData.networkName === 'unknown') newData.networkName = 'localhost';

      setChainData({ ...newData, provider });
    };

    try {
      // Enable session (triggers QR Code modal)
      await web3ModalProvider.enable();
      // User has chosen a provider and has signed in
      upsertData();
    } catch {
      // TODO: handle error (e.g. user closes the modal)
      return;
    }

    web3ModalProvider.on('accountsChanged', () => {
      upsertData();
    });

    web3ModalProvider.on('chainChanged', () => {
      upsertData();
    });

    web3ModalProvider.on('networkChanged', () => {
      upsertData();
    });

    // NOTE: This callback might get called multiple times for a single disconnect
    web3ModalProvider.on('disconnect', () => {
      onDisconnect();
    });
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
