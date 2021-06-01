import { ethers } from 'ethers';
import WalletConnectProvider from '@walletconnect/web3-provider';
import Web3Modal from 'web3modal';
import { initialChainData, getChainData, useChainData } from '../../chain-data';
import { abbrStr } from '../../chain-data/helpers';
import { go } from '../../utils/generic';
import Button from '../../components/button/button';
import { Modal as GenericModal } from '../../components/modal/modal';
import Dropdown, { DropdownMenu, DropdownMenuItem } from '../../components/dropdown/dropdown';
import './sign-in.scss';
import { SUPPORTED_NETWORKS, WALLET_CONNECT_RPC_PROVIDERS, useProviderSubscriptions } from '../../contracts';

const ConnectedStatus = () => {
  const { provider, setChainData, networkName, userAccount } = useChainData();

  const onDisconnect = () => {
    if (provider) {
      const externalProvider: any = provider.provider;
      if (typeof externalProvider.close === 'function') {
        externalProvider.close();
      }
    }
    setChainData('User disconnected', initialChainData);
  };

  return (
    <Dropdown
      menu={
        <DropdownMenu>
          <DropdownMenuItem onClick={onDisconnect}>Disconnect</DropdownMenuItem>
        </DropdownMenu>
      }
      icon={<img src="/arrow-dropdown.svg" alt="dropdown icon" />}
      alignIcon="start"
    >
      <div className="connected-status">
        <img src="/connected.svg" alt="connected icon" />
        <div className="connected-status-info">
          <p>{abbrStr(userAccount)}</p>
          <p className="text-xsmall">Connected to {networkName}</p>
        </div>
      </div>
    </Dropdown>
  );
};

const SignIn = () => {
  const { setChainData, provider, contracts, networkName } = useChainData();
  useProviderSubscriptions(provider);

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
            rpc: WALLET_CONNECT_RPC_PROVIDERS,
          },
        },
      },
    });

    const web3ModalProvider = await web3Modal.connect();
    // Enable session (triggers QR Code modal)
    const [err] = await go(web3ModalProvider.request({ method: 'eth_requestAccounts' }));
    if (err) {
      // TODO: handle error (e.g. user closes the modal)
      return;
    }

    // https://github.com/ethers-io/ethers.js/discussions/1480
    // NOTE: You can access the underlying 'web3ModalProvider' using 'provider' property
    const provider = new ethers.providers.Web3Provider(web3ModalProvider, 'any');
    // User has chosen a provider and has signed in
    setChainData('User connected', { ...(await getChainData(provider)) });
  };

  const isSupportedNetwork = !!provider && contracts === null;
  const supportedNetworks = SUPPORTED_NETWORKS.filter((name) => {
    // Disable localhost network on non-development environment
    if (process.env.REACT_APP_NODE_ENV !== 'development' && name === 'localhost') return false;
    else return true;
  }).join(', ');

  return (
    <>
      {!provider && <Button onClick={onWalletConnect}>Connect Wallet</Button>}
      {provider && <ConnectedStatus />}
      <GenericModal open={isSupportedNetwork} onClose={() => {}} hideCloseButton>
        <div className="text-center">
          <h5>Unsupported chain!</h5>

          <span className="marginTop">Supported networks are: {supportedNetworks}</span>
          <span>Current network: {networkName}</span>

          <p>Please use your wallet and connect to one of the supported networks</p>
        </div>
      </GenericModal>
    </>
  );
};

export default SignIn;
