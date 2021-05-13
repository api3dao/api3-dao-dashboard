import { ethers } from 'ethers';
import WalletConnectProvider from '@walletconnect/web3-provider';
import Web3Modal from 'web3modal';
import localhostDao from './contract-deployments/localhost-dao.json';
import ropstenDao from './contract-deployments/ropsten-dao.json';
import { initialChainData, useChainData, ChainData } from './chain-data';
import Button from './components/button/button';
import { useEffect } from 'react';
import GenericModal from './components/modal/modal';
import './wallet-connect-demo.scss';

const daoNetworks = [localhostDao, ropstenDao];

const getChainData = async (provider: ethers.providers.Web3Provider): Promise<ChainData> => {
  const networkChainId = await (await provider.getNetwork()).chainId.toString();

  const daoNetwork = daoNetworks.find(({ chainId }) => chainId === networkChainId);

  const newData = {
    userAccount: await provider.getSigner().getAddress(),
    networkName: await (await provider.getNetwork()).name,
    chainId: networkChainId,
    contracts: daoNetwork?.contracts ?? null,
    latestBlock: await provider.getBlockNumber(),
  };
  if (newData.networkName === 'unknown') newData.networkName = 'localhost';

  return { ...newData, provider };
};

const useRefreshChainDataAfterMinedBlock = () => {
  const { provider, setChainData } = useChainData();

  useEffect(() => {
    if (!provider) return;

    const handler = async () => {
      setChainData(await getChainData(provider));
    };

    provider.on('block', handler);
    return () => {
      provider.off('block', handler);
    };
  }, [provider, setChainData]);
};

const WalletConnectDemo = () => {
  const { setChainData, provider, contracts, networkName } = useChainData();
  useRefreshChainDataAfterMinedBlock();

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
      setChainData(await getChainData(provider));
    };

    try {
      // Enable session (triggers QR Code modal)
      await web3ModalProvider.request({ method: 'eth_requestAccounts' });
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

    web3ModalProvider.on('chainChanged', () => {
      upsertData();
    });

    // NOTE: This callback might get called multiple times for a single disconnect
    web3ModalProvider.on('disconnect', () => {
      onDisconnect();
    });
  };

  const isSupportedNetwork = !!provider && contracts === null;
  const supportedNetworks = daoNetworks
    .map((network) => network.name)
    .filter((name) => {
      // disable localhost network on non-development environment
      if (process.env.REACT_APP_NODE_ENV !== 'development' && name === 'localhost') return false;
      else return true;
    })
    .join(', ');

  return (
    <>
      {!provider && <Button onClick={onWalletConnect}>Connect Wallet</Button>}
      {provider && <Button onClick={onDisconnect}>Disconnect</Button>}
      <GenericModal open={isSupportedNetwork} onClose={() => {}} hideCloseButton>
        <h5>Unsupported chain!</h5>

        <span className="marginTop">Supported networks are: {supportedNetworks}</span>
        <span>Current network: {networkName}</span>

        <p>Please use your wallet and connect to one of the supported networks</p>
      </GenericModal>
    </>
  );
};

export default WalletConnectDemo;
