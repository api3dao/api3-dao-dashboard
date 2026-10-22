import classNames from 'classnames';
import Button from '../button';
import { images } from '../../utils';
import { links } from '../../utils/links';
import styles from './snapshot-banner.module.scss';
import { ExternalLinkIcon } from '../icons';

interface Props {
  className?: string;
}

export default function SnapshotBanner(props: Props) {
  return (
    <div className={classNames(styles.root, props.className)}>
      <div className={styles.content}>
        <img src={images.infoCircle} alt="" />
        <div className={styles.text}>
          <h2 className={styles.title}>API3 DAO governance has moved to Snapshot.</h2>
          <p className={styles.subtitle}>
            The staking pool no longer pays rewards. We recommend that you unstake and withdraw your tokens. Vote on DAO
            proposals on Snapshot.
          </p>
        </div>
      </div>

      <div className={styles.linkContainer}>
        <Button type="secondary-neutral" size="sm" sm={{ size: 'md' }} href={links.SNAPSHOT} className={styles.link}>
          Go to Snapshot
          <ExternalLinkIcon />
        </Button>
      </div>
    </div>
  );
}
