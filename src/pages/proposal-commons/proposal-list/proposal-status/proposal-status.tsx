import classNames from 'classnames';
import { Proposal } from '../../../../chain-data';
import { voteSliderSelector } from '../../../../logic/proposals/selectors';
import { NegativeVoteIcon, PositiveVoteIcon } from '../../vote-slider/vote-slider';
import './proposal-status.scss';
import Button from '../../../../components/button/button';

interface Props {
  proposal: Proposal;
  large?: true;
}

const ProposalStatus = (props: Props): JSX.Element => {
  const { proposal, large } = props;
  let proposalStatus = voteSliderSelector(proposal).proposalStatus;

  proposalStatus = 'Execute' as any;

  if (proposal.open) {
    // Open proposal status can be either 'Failing' or 'Passing'
    return <p className={classNames('proposal-status', proposalStatus.toLowerCase())}>{proposalStatus}</p>;
  } else {
    const showIcon = proposalStatus === 'Executed' || proposalStatus === 'Rejected';

    return (
      <div className="text-large">
        {showIcon && (
          <span className="proposal-status-icon">
            {proposalStatus === 'Rejected' && <NegativeVoteIcon large={large} />}
            {proposalStatus === 'Executed' && <PositiveVoteIcon large={large} />}
          </span>
        )}
        {proposalStatus === 'Execute' ? (
          // TODO: implement onClick action
          <Button type="text" className="proposal-status-execute" buttonClassName={large ? 'text-large-override' : ''}>
            {proposalStatus}
          </Button>
        ) : (
          <span className={classNames('proposal-status', proposalStatus.toLowerCase())}>{proposalStatus}</span>
        )}
      </div>
    );
  }
};

export default ProposalStatus;
