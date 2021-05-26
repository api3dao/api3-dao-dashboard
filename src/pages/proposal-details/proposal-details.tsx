import { useState } from 'react';
import { useParams } from 'react-router';
import { Proposal, useChainData } from '../../chain-data';
import { BaseLayout } from '../../components/layout/layout';
import VoteSlider from '../../components/vote-slider/vote-slider';
import { Modal } from '../../components/modal/modal';
import { useApi3Voting } from '../../contracts';
import { decodeProposalTypeAndId } from '../../logic/proposals/encoding';
import { proposalDetailsSelector, voteSliderSelector } from '../../logic/proposals/selectors';
import { useProposalState } from '../../logic/proposals/use-proposal-state';
import VoteForm from './vote-form/vote-form';

interface RouterParameters {
  typeAndId: string;
}

const ProposalDetailsPage = () => {
  const { typeAndId } = useParams<RouterParameters>();
  // TODO: Validate id and type - a proposal might not exist (e.g. user tries invalid voteId)
  const { id, type } = decodeProposalTypeAndId(typeAndId);
  const { proposalState } = useChainData();
  useProposalState();

  const proposal = proposalDetailsSelector(proposalState, type, id);
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
      <VoteSlider {...voteSliderData} />
      <button onClick={() => setVoteModalOpen(true)}>Vote</button>
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
  );
};

export default ProposalDetailsPage;
