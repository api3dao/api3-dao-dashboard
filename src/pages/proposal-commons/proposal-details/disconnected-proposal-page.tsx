import ConnectButton from '../../../components/connect-button';
import { images } from '../../../utils';
import styles from './disconnected-proposal-page.module.scss';

export const DisconnectedProposalPage = () => {
  return (
    <div className={styles.container}>
      <img src={images.walletDisconnected} alt="" />
      <h1>Connect your wallet to see proposal details</h1>
      <ConnectButton type="secondary-neutral" size="sm" sm={{ size: 'md' }}>
        Connect Wallet
      </ConnectButton>
    </div>
  );
};
