import { Fragment, useState } from 'react';
import { ethers } from 'ethers';
import WalletConnectProvider from '@walletconnect/web3-provider';
import Web3Modal from 'web3modal';
import classNames from 'classnames';
import { initialChainData, getNetworkData, useChainData, SettableChainData } from '../../chain-data';
import { abbrStr } from '../../chain-data/helpers';
import { go } from '../../utils/generic';
import Button from '../../components/button/button';
import { Modal as GenericModal } from '../../components/modal/modal';
import Dropdown, { DropdownMenu, DropdownMenuItem } from '../../components/dropdown/dropdown';
import styles from './sign-in.module.scss';
import globalStyles from '../../styles/global-styles.module.scss';
import * as notifications from '../../components/notifications/notifications';
import { images, messages } from '../../utils';
import { SUPPORTED_NETWORKS, WALLET_CONNECT_RPC_PROVIDERS, useProviderSubscriptions } from '../../contracts';

type Props = {
  dark?: boolean;
  position: 'mobileMenu' | 'navigation';
};

const ConnectedStatus = ({ dark, position }: Props) => {
  const { provider, setChainData, networkName, userAccount, availableAccounts } = useChainData();

  const [changeAccountOpen, setChangeAccountOpen] = useState(false);
  const openModal = () => setChangeAccountOpen(true);
  const closeModal = () => setChangeAccountOpen(false);

  const onAccountChange = (account: string) => async () => {
    if (!provider) return;

    setChainData('Change user account', {
      userAccount: account,
      signer: provider.getSigner(account),
    });
  };

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
    <div className={styles.connectedStatus} data-cy="connected-status">
      <img src={dark ? images.connectedDark : images.connected} alt="connected icon" />
      <div className={classNames(styles.connectedStatusInfo, { [styles.dark]: dark })}>
        <p data-cy="account">{abbrStr(userAccount)}</p>
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
          {availableAccounts.length > 1 && (
            <Button
              type="secondary"
              onClick={openModal}
              className={classNames({ [styles.mobileMenuButton]: position === 'mobileMenu' })}
            >
              Change account
            </Button>
          )}
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
              {availableAccounts.length > 1 && <DropdownMenuItem onClick={openModal}>Change account</DropdownMenuItem>}
            </DropdownMenu>
          }
          icon={<img src={dark ? images.arrowDropdownDark : images.arrowDropdown} alt="dropdown icon" />}
          alignIcon="start"
        >
          {connectedContent}
        </Dropdown>
      )}

      {availableAccounts.length > 1 && (
        <GenericModal open={changeAccountOpen} onClose={closeModal}>
          <ul className={styles.availableAccounts} data-cy="available-accounts">
            {availableAccounts.map((account) => (
              <Button
                key={account}
                type="text"
                className={styles.availableAccountButton}
                onClick={onAccountChange(account)}
              >
                {account}
              </Button>
            ))}
          </ul>
        </GenericModal>
      )}
    </div>
  );
};

export const connectWallet = (setChainData: SettableChainData['setChainData']) => async () => {
  const web3Modal = new Web3Modal({
    // If true, the provider will be cached in local storage and there will be no modal asking on re-login and the same
    // provider will be used.
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

  // Wrapped in callback to prevent synchronous error, because `request` property is not guaranteed to exist
  // TODO: Should we call this in case of wallet connect?
  const [requestAccountsError] = await go(() => web3ModalProvider.request({ method: 'eth_requestAccounts' }));
  // For example, user wants to connect via metamask, but declines connecting his account. We don't want to show toast
  // message in this case either.
  if (requestAccountsError) return;

  // https://github.com/ethers-io/ethers.js/discussions/1480
  // NOTE: You can access the underlying 'web3ModalProvider' using the 'provider' property
  const externalProvider = new ethers.providers.Web3Provider(web3ModalProvider, 'any');
  const [networkDataError, data] = await go(getNetworkData(externalProvider));
  if (networkDataError) {
    return notifications.error({ message: messages.FAILED_TO_LOAD_CHAIN_DATA, errorOrMessage: networkDataError });
  }

  setChainData('User connected', { ...data });
};

const SignIn = ({ dark, position }: Props) => {
  const { setChainData, provider, networkName } = useChainData();
  useProviderSubscriptions(provider);

  const isSignedIn = !!provider;
  const supportedNetworks = SUPPORTED_NETWORKS.filter((name) => {
    // Disable localhost network on non-development environment
    if (process.env.REACT_APP_NODE_ENV !== 'development' && name === 'localhost') return false;
    else return true;
  });
  const isSupportedNetwork = !isSignedIn || supportedNetworks.includes(networkName);

  return (
    <>
      {!provider && (
        <Button
          type={dark ? 'secondary' : 'primary'}
          onClick={connectWallet(setChainData)}
          className={classNames({
            [styles.mobileMenuButton]: dark,
            [styles.fullWidthMobile]: position === 'navigation',
          })}
        >
          Connect Wallet
        </Button>
      )}
      {provider && <ConnectedStatus dark={dark} position={position} />}
      <GenericModal open={!isSupportedNetwork} onClose={() => {}} hideCloseButton>
        <div className={globalStyles.textCenter}>
          <img className={styles.unsupportedNetworkIcon} src={images.unsupportedNetwork} alt="network not supported" />
          <h5>Unsupported chain!</h5>

          <p className={globalStyles.mtXl}>
            Supported networks:{' '}
            {supportedNetworks
              .map((network) => <b>{network}</b>)
              .map((Component, i) => (
                <Fragment key={i}>
                  {i !== 0 && ', '}
                  {Component}
                </Fragment>
              ))}
          </p>
          <p className={globalStyles.mtXl}>
            Current network: <b>{networkName}</b>
          </p>

          <p className={globalStyles.mtXl}>Please connect your wallet to a supported network.</p>
        </div>
      </GenericModal>
    </>
  );
};

export default SignIn;
