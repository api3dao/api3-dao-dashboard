import classNames from 'classnames';
import { Proposal, useChainData } from '../../../../chain-data';
import { voteSliderSelector } from '../../../../logic/proposals/selectors';
import { NegativeVoteIcon, PositiveVoteIcon } from '../../vote-slider/vote-slider';
import Button from '../../../../components/button';
import styles from './proposal-status.module.scss';
import { useApi3Voting } from '../../../../contracts';
import { handleTransactionError } from '../../../../utils';

interface Props {
  proposal: Proposal;
  large?: true;
}

const ProposalStatus = (props: Props) => {
  const voting = useApi3Voting();
  const { signer, setChainData } = useChainData();
  const { proposal, large } = props;
  const proposalStatus = voteSliderSelector(proposal).proposalStatus;

  if (proposal.open) {
    return (
      <p
        // Open proposal status can be either 'Failing' or 'Passing'
        className={classNames(styles.proposalStatus, {
          [styles.failing]: proposalStatus === 'Failing',
          [styles.passing]: proposalStatus === 'Passing',
          [styles.large]: large,
        })}
      >
        {proposalStatus}
      </p>
    );
  }

  const showIcon = proposalStatus === 'Executed' || proposalStatus === 'Rejected';

  return (
    <div className={classNames(styles.flex, { [styles.large]: large })}>
      {showIcon && (
        <span className={styles.icon}>
          {proposalStatus === 'Rejected' && <NegativeVoteIcon fill={true} />}
          {proposalStatus === 'Executed' && <PositiveVoteIcon fill={true} />}
        </span>
      )}
      {proposalStatus === 'Execute' ? (
        <Button
          type="link-blue"
          size="sm"
          md={{ size: 'lg' }}
          className={styles.execute}
          onClick={async () => {
            if (!voting) return;
            const tx = await handleTransactionError(
              voting[proposal.type].connect(signer!).executeVote(proposal.voteId)
            );
            if (tx) {
              setChainData('Save execute transaction', (state) => ({
                transactions: [...state.transactions, { type: 'execute', tx }],
              }));
            }
          }}
          disabled={!voting}
        >
          {proposalStatus}
        </Button>
      ) : (
        <span
          className={classNames(styles.proposalStatus, {
            [styles.executed]: proposalStatus === 'Executed',
            [styles.rejected]: proposalStatus === 'Rejected',
          })}
        >
          {proposalStatus}
        </span>
      )}
    </div>
  );
};

export default ProposalStatus;
