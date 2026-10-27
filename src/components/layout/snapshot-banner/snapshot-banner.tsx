import Button from '../../button';
import { links } from '../../../utils/links';
import styles from './snapshot-banner.module.scss';
import { ExternalLinkIcon, InfoCircleIcon } from '../../icons';

export default function SnapshotBanner() {
  return (
    <div className={styles.root}>
      <div className={styles.content}>
        <InfoCircleIcon className={styles.icon} />
        <div>
          <h2 className={styles.title}>API3 DAO governance has moved to Snapshot.</h2>
          <p className={styles.subtitle}>
            The staking pool no longer pays rewards, so we recommend that you unstake and withdraw your tokens. Go to
            Snapshot to vote on DAO proposals.
          </p>
        </div>
        <Button type="primary" size="xs" sm={{ size: 'sm' }} href={links.SNAPSHOT} className={styles.link}>
          Go to Snapshot
          <ExternalLinkIcon />
        </Button>
      </div>
    </div>
  );
}
