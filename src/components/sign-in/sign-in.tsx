import { ethers } from 'ethers';
import WalletConnectProvider from '@walletconnect/web3-provider';
import Web3Modal from 'web3modal';
import classNames from 'classnames';
import { initialChainData, getNetworkData, useChainData } from '../../chain-data';
import { abbrStr } from '../../chain-data/helpers';
import { go } from '../../utils/generic';
import Button from '../../components/button/button';
import { Modal as GenericModal } from '../../components/modal/modal';
import Dropdown, { DropdownMenu, DropdownMenuItem } from '../../components/dropdown/dropdown';
import styles from './sign-in.module.scss';
import globalStyles from '../../styles/global-styles.module.scss';
import * as notifications from '../../components/notifications/notifications';
import { messages } from '../../utils/messages';
import { SUPPORTED_NETWORKS, WALLET_CONNECT_RPC_PROVIDERS, useProviderSubscriptions } from '../../contracts';

type Props = {
  dark?: boolean;
  position: 'mobileMenu' | 'navigation';
};

const ConnectedStatus = ({ dark, position }: Props) => {
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

  const connectedContent = (
    <div className={styles.connectedStatus}>
      <img src={`/connected${dark ? '-dark' : ''}.svg`} alt="connected icon" />
      <div className={classNames(styles.connectedStatusInfo, { [styles.dark]: dark })}>
        <p>{abbrStr(userAccount)}</p>
        <p className={globalStyles.textXSmall}>Connected to {networkName}</p>
      </div>
    </div>
  );

  return (
    <div
      className={classNames({
        [styles.hideSignInStatus]: position === 'navigation',
        [styles.mobileMenuConnectedStatus]: position === 'mobileMenu',
      })}
    >
      {position === 'mobileMenu' ? (
        <>
          {connectedContent}
          <Button
            type="secondary"
            onClick={onDisconnect}
            className={classNames({ [styles.mobileMenuButton]: position === 'mobileMenu' })}
          >
            Disconnect Wallet
          </Button>
        </>
      ) : (
        <Dropdown
          menu={
            <DropdownMenu position={dark ? 'top' : 'bottom'}>
              <DropdownMenuItem onClick={onDisconnect}>Disconnect Wallet</DropdownMenuItem>
            </DropdownMenu>
          }
          icon={<img src={dark ? '/arrow-dropdown-dark.svg' : '/arrow-dropdown.svg'} alt="dropdown icon" />}
          alignIcon="start"
        >
          {connectedContent}
        </Dropdown>
      )}
    </div>
  );
};

const SignIn = ({ dark, position }: Props) => {
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

    // Enable session (connection), this triggers QR Code modal in case of wallet connect
    const [connectionError, web3ModalProvider] = await go(web3Modal.connect());
    // Connection error will often be caused by user declining to connect (e.g. close the modal) so we don't show any
    // toast message to the user.
    // NOTE: In case users closes the wallet connect modal there is no connection error, but the provider will be null
    if (connectionError || !web3ModalProvider) return;

    const [requestAccountsError] = await go(web3ModalProvider.request({ method: 'eth_requestAccounts' }));
    // For example, user wants to connect via metamask, but declines connecting his account. We don't want to show toast
    // message in this cas either.
    if (requestAccountsError) return;

    // https://github.com/ethers-io/ethers.js/discussions/1480
    // NOTE: You can access the underlying 'web3ModalProvider' using the 'provider' property
    const externalProvider = new ethers.providers.Web3Provider(web3ModalProvider, 'any');
    const [networkDataError, data] = await go(getNetworkData(externalProvider));
    if (networkDataError) {
      notifications.error(messages.FAILED_TO_LOAD_CHAIN_DATA);
      return;
    }

    setChainData('User connected', { ...data });
  };

  const isSignedIn = !!provider && contracts !== null;
  const supportedNetworks = SUPPORTED_NETWORKS.filter((name) => {
    // Disable localhost network on non-development environment
    if (process.env.REACT_APP_NODE_ENV !== 'development' && name === 'localhost') return false;
    else return true;
  }).join(', ');
  const isSupportedNetwork = !!isSignedIn || supportedNetworks.includes(networkName);

  return (
    <>
      {!provider && (
        <Button
          type={dark ? 'secondary' : 'primary'}
          onClick={onWalletConnect}
          className={classNames({ [styles.mobileMenuButton]: dark })}
        >
          Connect Wallet
        </Button>
      )}
      {provider && <ConnectedStatus dark={dark} position={position} />}
      <GenericModal open={!isSupportedNetwork} onClose={() => {}} hideCloseButton>
        <div className={globalStyles.textCenter}>
          <h5>Unsupported chain!</h5>

          <p className={globalStyles.mtXl}>Supported networks are: {supportedNetworks}</p>
          <p className={globalStyles.mtXl}>
            Current network: <b>{networkName}</b>
          </p>

          <p className={globalStyles.mtXl}>Please use your wallet and connect to one of the supported networks</p>
        </div>
      </GenericModal>
    </>
  );
};

export default SignIn;
