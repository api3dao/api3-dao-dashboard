import { useState } from 'react';
import { useParams } from 'react-router';
import { Proposal, useChainData } from '../../chain-data';
import { BaseLayout } from '../../components/layout/layout';
import { Modal } from '../../components/modal/modal';
import VoteSlider from '../../components/vote-slider/vote-slider';
import Timer from '../../components/timer/timer';
import Button from '../../components/button/button';
import Tag from '../../components/tag/tag';
import BorderedBox from '../../components/bordered-box/bordered-box';
import { useApi3Voting } from '../../contracts';
import { decodeProposalTypeAndId } from '../../logic/proposals/encoding';
import { proposalDetailsSelector, voteSliderSelector } from '../../logic/proposals/selectors';
import { useLoadAllProposals } from '../../logic/proposals/use-proposal-state';
import VoteForm from './vote-form/vote-form';
import './proposal-details.scss';

interface RouterParameters {
  typeAndId: string;
}

const ProposalDetailsPage = () => {
  const { typeAndId } = useParams<RouterParameters>();
  // TODO: Validate id and type - a proposal might not exist (e.g. user tries invalid voteId)
  const { id, type } = decodeProposalTypeAndId(typeAndId);
  const { proposals } = useChainData();
  useLoadAllProposals();

  const proposal = proposalDetailsSelector(proposals, type, id);
  // TODO: Loading component
  return <BaseLayout>{!proposal ? <p>Loading...</p> : <ProposalDetails proposal={proposal} />}</BaseLayout>;
};

interface ProposalDetailsProps {
  proposal: Proposal;
}

const ProposalDetails = (props: ProposalDetailsProps) => {
  const { proposal } = props;
  const [voteModalOpen, setVoteModalOpen] = useState(false);
  const voting = useApi3Voting();

  const voteSliderData = voteSliderSelector(proposal);

  // NOTE: This should never happen, loading component in proposal details page should
  // make sure we are connected to valid chain and have valid proposal loaded
  if (!voting) return null;

  return (
    <div>
      <div className="proposal-details-subheader">
        <p className="tertiary-color medium">#{proposal.voteId.toString()}</p>
        <Tag type={proposal.type}>
          <span className="capitalize">{proposal.type}</span>
        </Tag>
      </div>
      <div className="proposal-details-header">
        <h4>{proposal.metadata.description}</h4>
        <div className="proposal-details-timer">
          <p className="text-xsmall medium">Ends on {proposal.deadline.toDateString()}</p>
          <Timer size="large" start={proposal.startDate} deadline={proposal.deadline} />
        </div>
      </div>
      <h5 className="capitalize pink-color">{voteSliderData.status}</h5>
      <div className="proposal-details-vote-section">
        <VoteSlider {...voteSliderData} size="large" />
        <Button type="secondary" size="large" onClick={() => setVoteModalOpen(true)}>
          Vote
        </Button>
        <Modal open={voteModalOpen} onClose={() => setVoteModalOpen(false)}>
          <VoteForm
            voteId={proposal.voteId.toString()}
            onConfirm={async (choice) => {
              setVoteModalOpen(false);
              await voting[proposal.type].vote(proposal.voteId, choice === 'for', true);
            }}
          />
        </Modal>
      </div>
      <BorderedBox
        header={
          <div className="bordered-box-header _ml-lg">
            <h5>Summary</h5>
            <Button type="text">(Link to discussion)</Button>
          </div>
        }
        content={
          <div className="proposal-details-summary">
            <p className="proposal-details-item secondary-color">{proposal.metadata.description}</p>
            <div className="proposal-details-item">
              <p className="bold">Target contract address</p>
              <p className="secondary-color">{proposal.creator}</p>
            </div>
            <div className="proposal-details-item">
              <p className="bold">Target contract signature</p>
              <p className="secondary-color">{proposal.metadata.targetSignature}</p>
            </div>
            <div className="proposal-details-item">
              <p className="bold">Value</p>
              {/* TODO: Add value */}
              <p className="secondary-color">Value</p>
            </div>
            <div className="proposal-details-item">
              <p className="bold">Parameters</p>
              {/* TODO: Add parameters value */}
              <p className="secondary-color">Parameters</p>
            </div>
          </div>
        }
      />
    </div>
  );
};

export default ProposalDetailsPage;
