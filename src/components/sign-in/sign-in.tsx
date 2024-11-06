import { Fragment } from 'react';
import classNames from 'classnames';
import { Address, useDisconnect, useEnsName } from 'wagmi';
import { useChainData } from '../../chain-data';
import { abbrStr } from '../../chain-data/helpers';
import ConnectButton from '../connect-button';
import { Modal as GenericModal } from '../../components/modal';
import Dropdown, { DropdownMenu, DropdownMenuItem } from '../../components/dropdown';
import styles from './sign-in.module.scss';
import globalStyles from '../../styles/global-styles.module.scss';
import { images } from '../../utils';
import { SUPPORTED_NETWORKS, useProviderSubscriptions } from '../../contracts';
import DisconnectIcon from './disconnect-icon';

type Props = {
  dark?: boolean;
  position: 'mobileMenu' | 'navigation';
};

const ConnectedStatus = ({ dark, position }: Props) => {
  const { networkName, userAccount } = useChainData();

  const { disconnect } = useDisconnect();
  const handleDisconnect = () => disconnect();

  const { data: userAccountName } = useEnsName({ address: userAccount as Address });

  const connectedContent = (
    <div className={styles.connectedStatus} data-cy="connected-status">
      <img src={dark ? images.connectedDark : images.connected} alt="connected icon" />
      <div className={classNames(styles.connectedStatusInfo, { [styles.dark]: dark })}>
        <p data-cy="account" className={styles.accountName}>
          {userAccountName ? userAccountName : abbrStr(userAccount)}
        </p>
        <p className={styles.connectedTo}>Connected to {networkName}</p>
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
          <button onClick={handleDisconnect} className={styles.mobileMenuButton}>
            <DisconnectIcon /> Disconnect
          </button>
        </>
      ) : (
        <Dropdown
          className={styles.accountDropdown}
          menu={
            <DropdownMenu position={dark ? 'top' : 'bottom'} className={styles.accountDropdownMenu}>
              <DropdownMenuItem className={styles.accountDropdownItem} onClick={handleDisconnect}>
                <DisconnectIcon /> Disconnect
              </DropdownMenuItem>
            </DropdownMenu>
          }
          icon={<img src={images.arrowDropdown} alt="dropdown icon" />}
          alignIcon="start"
        >
          {connectedContent}
        </Dropdown>
      )}
    </div>
  );
};

const SignIn = ({ dark, position }: Props) => {
  const { provider, networkName } = useChainData();
  useProviderSubscriptions();

  const isSignedIn = !!provider;
  const supportedNetworks = SUPPORTED_NETWORKS.filter((name) => {
    // Disable localhost network on non-development environment
    if (process.env.REACT_APP_NODE_ENV !== 'development' && name === 'hardhat') return false;
    else return true;
  });
  const isSupportedNetwork = !isSignedIn || supportedNetworks.includes(networkName);

  return (
    <>
      {!provider && (
        <ConnectButton
          type={dark ? 'primary' : 'secondary'}
          size="sm"
          md={{ size: 'md' }}
          className={styles.connectButton}
        >
          Connect Wallet
        </ConnectButton>
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
