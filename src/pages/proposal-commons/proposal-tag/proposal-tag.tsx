import classNames from 'classnames';
import styles from './proposal-tag.module.scss';

type Props = {
  id: string;
  type?: 'primary' | 'secondary';
};

const ProposalTag = ({ id, type = 'primary' }: Props) => (
  <div
    className={classNames(styles.tag, {
      [styles.primary]: type === 'primary',
      [styles.secondary]: type === 'secondary',
    })}
  >
    <span className={styles.proposalId}>{id}</span>
    <span className={styles.proposalType}>{type}</span>
  </div>
);

export default ProposalTag;
