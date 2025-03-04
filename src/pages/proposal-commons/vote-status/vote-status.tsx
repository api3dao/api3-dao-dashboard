import classNames from 'classnames';
import styles from './vote-status.module.scss';
import globalStyles from './../../../styles/global-styles.module.scss';
import { VOTER_STATES } from '../../../chain-data';

interface Props {
  voterState: keyof typeof VOTER_STATES;
  wasDelegated: boolean;
  large?: true;
}

const VoteStatus = (props: Props) => {
  const { voterState, wasDelegated, large } = props;

  return (
    <div className={classNames({ [styles.wrapperLarge]: large }, globalStyles.textCenter)}>
      {large && VOTER_STATES[voterState] !== 'Unvoted' && (
        <img
          className={styles.icon}
          src={`${VOTER_STATES[voterState] === 'Voted For' ? '/voted-for.svg' : '/voted-against.svg'}`}
          alt="voter state icon"
        />
      )}
      <span
        className={classNames(styles.status, {
          [styles.unvoted]: VOTER_STATES[voterState] === 'Unvoted',
          [styles.votedAgainst]: VOTER_STATES[voterState] === 'Voted Against',
          [styles.votedFor]: VOTER_STATES[voterState] === 'Voted For',
        })}
      >
        {VOTER_STATES[voterState]}
        {VOTER_STATES[voterState] !== 'Unvoted' && wasDelegated && (
          <div className={styles.votedByDelegate}>(by delegate)</div>
        )}
      </span>
    </div>
  );
};

export default VoteStatus;
