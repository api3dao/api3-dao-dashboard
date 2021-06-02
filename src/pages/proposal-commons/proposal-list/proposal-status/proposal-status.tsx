import classNames from 'classnames';
import { Proposal } from '../../../../chain-data';
import { voteSliderSelector } from '../../../../logic/proposals/selectors';
import { NegativeVoteIcon, PositiveVoteIcon } from '../../vote-slider/vote-slider';
import './proposal-status.scss';
import Button from '../../../../components/button/button';

interface Props {
  proposal: Proposal;
}

const ProposalStatus = (props: Props): JSX.Element => {
  const { proposal } = props;
  const proposalStatus = voteSliderSelector(proposal).proposalStatus;

  if (proposal.open) {
    // Open proposal status can be either 'Failing' or 'Passing'
    return <p className={classNames('proposal-status', proposalStatus.toLowerCase())}>{proposalStatus}</p>;
  } else {
    return (
      <div>
        <span className="proposal-status-icon">
          {proposalStatus === 'Rejected' && <NegativeVoteIcon />}
          {proposalStatus === 'Executed' && <PositiveVoteIcon />}
        </span>
        {proposalStatus === 'Execute' ? (
          <Button type="text" className="proposal-status-executed" buttonClassName="text-xsmall">
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
