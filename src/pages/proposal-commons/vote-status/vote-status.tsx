import classNames from 'classnames';
import styles from './vote-status.module.scss';
import { VOTER_STATES } from '../../../chain-data';

interface Props {
  voterState: keyof typeof VOTER_STATES;
  large?: true;
}

const VoteStatus = (props: Props) => {
  const { voterState, large } = props;

  return (
    <div className={classNames({ [styles.wrapperLarge]: large })}>
      {large && voterState !== 0 && (
        <img
          className={styles.icon}
          src={`${voterState === 1 ? '/voted-for.svg' : '/voted-against.svg'}`}
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
      </span>
    </div>
  );
};

export default VoteStatus;
