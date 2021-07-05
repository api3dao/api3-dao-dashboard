import classNames from 'classnames';
import { Proposal, useChainData } from '../../../../chain-data';
import { voteSliderSelector } from '../../../../logic/proposals/selectors';
import { NegativeVoteIcon, PositiveVoteIcon } from '../../vote-slider/vote-slider';
import Button from '../../../../components/button/button';
import styles from './proposal-status.module.scss';
import { useApi3Voting } from '../../../../contracts';
import { go, GO_ERROR_INDEX, GO_RESULT_INDEX, isGoSuccess, isUserRejection, messages } from '../../../../utils';
import { notifications } from '../../../../components/notifications/notifications';

interface Props {
  proposal: Proposal;
  large?: true;
}

const ProposalStatus = (props: Props) => {
  const voting = useApi3Voting();
  const { setChainData } = useChainData();
  const { proposal, large } = props;
  const proposalStatus = voteSliderSelector(proposal).proposalStatus;

  if (proposal.open) {
    return (
      <p
        // Open proposal status can be either 'Failing' or 'Passing'
        className={classNames(styles.proposalStatus, {
          [styles.failing]: proposalStatus === 'Failing',
          [styles.passing]: proposalStatus === 'Passing',
        })}
      >
        {proposalStatus}
      </p>
    );
  }

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
        <Button
          type="text"
          className={styles.execute}
          onClick={async () => {
            if (!voting) return;
            const goTransaction = await go(voting[proposal.type].executeVote(proposal.voteId));
            if (!isGoSuccess(goTransaction)) {
              if (isUserRejection(goTransaction[GO_ERROR_INDEX])) {
                notifications.info({ message: messages.TX_GENERIC_REJECTED });
                return;
              }
              notifications.error({
                message: messages.TX_GENERIC_ERROR,
                errorOrMessage: goTransaction[GO_ERROR_INDEX],
              });
              return;
            }
            setChainData('Save execute transaction', (state) => ({
              transactions: [...state.transactions, { type: 'execute', tx: goTransaction[GO_RESULT_INDEX] }],
            }));
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
