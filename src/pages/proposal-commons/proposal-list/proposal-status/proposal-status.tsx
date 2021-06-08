import classNames from 'classnames';
import { Proposal } from '../../../../chain-data';
import { voteSliderSelector } from '../../../../logic/proposals/selectors';
import { NegativeVoteIcon, PositiveVoteIcon } from '../../vote-slider/vote-slider';
import styles from './proposal-status.module.scss';

import Button from '../../../../components/button/button';

interface Props {
  proposal: Proposal;
  large?: true;
}

const ProposalStatus = (props: Props): JSX.Element => {
  const { proposal, large } = props;
  const proposalStatus = voteSliderSelector(proposal).proposalStatus;

  if (proposal.open) {
    return (
      <p
        // Open proposal status can be either 'Failing' or 'Passing'
        className={classNames({
          [styles.failing]: proposalStatus === 'Failing',
          [styles.passing]: proposalStatus === 'Passing',
        })}
      >
        {proposalStatus}
      </p>
    );
  } else {
    const showIcon = proposalStatus === 'Executed' || proposalStatus === 'Rejected';

    return (
      <div className={styles.flex}>
        {showIcon && (
          <span className={styles.icon}>
            {proposalStatus === 'Rejected' && <NegativeVoteIcon large={large} />}
            {proposalStatus === 'Executed' && <PositiveVoteIcon large={large} />}
          </span>
        )}
        {proposalStatus === 'Execute' ? (
          // TODO: implement onClick action
          <Button type="text" className={styles.execute} buttonClassName={large ? styles.override : ''}>
            {proposalStatus}
          </Button>
        ) : (
          <span
            className={classNames({
              [styles.executed]: proposalStatus === 'Executed',
              [styles.rejected]: proposalStatus === 'Rejected',
            })}
          >
            {proposalStatus}
          </span>
        )}
      </div>
    );
  }
};

export default ProposalStatus;
