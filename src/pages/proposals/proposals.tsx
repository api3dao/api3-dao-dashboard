import { ethers } from 'ethers';
import { useState } from 'react';
import { useChainData } from '../../chain-data';
import Button from '../../components/button/button';
import Layout from '../../components/layout/layout';
import { Modal } from '../../components/modal/modal';
import BorderedBox from '../../components/bordered-box/bordered-box';
import Treasury from './treasury/treasury';
import { useApi3Token, useApi3Voting, useApi3AgentAddresses } from '../../contracts';
import { useProposalState } from '../../logic/proposals/use-proposal-state';
import { buildEVMScript, buildExtendedMetadata, NewProposalFormData } from '../../logic/proposals/encoding';
import ProposalList from './proposal-list';
import NewProposalForm from './forms/new-proposal-form';
import DelegateVotesForm from './forms/delegate-votes-form';
import UndelegateForm from './forms/undelegate/undelegate-form';
import './proposals.scss';

const Proposals = () => {
  const { provider, proposalState } = useChainData();
  const api3Voting = useApi3Voting();
  const api3Token = useApi3Token();
  const api3Agent = useApi3AgentAddresses();

  const [openDelegationModal, setOpenDelegationModal] = useState(false);
  const [openUndelegateModal, setOpenUndelegateModal] = useState(false);

  const [openNewProposalModal, setOpenNewProposalModal] = useState(false);

  useProposalState();

  const onCreateProposal = async (formData: NewProposalFormData) => {
    if (!api3Token || !api3Voting || !api3Agent) return null;

    // TODO: why is newVote not picked up when initialized from artifact ABI?
    const votingAbi = [
      'function getVote(uint256 _voteId) public view returns (bool open, bool executed, uint64 startDate, uint64 snapshotBlock, uint64 supportRequired, uint64 minAcceptQuorum, uint256 yea, uint256 nay, uint256 votingPower, bytes script)',
      'function newVote(bytes _executionScript, string _metadata, bool _castVote, bool _executesIfDecided) external returns (uint256 voteId)',
      'event StartVote(uint256 indexed voteId, address indexed creator, string metadata)',
    ];
    const votingApp = new ethers.Contract(api3Voting[formData.type].address, votingAbi, provider?.getSigner());
    await votingApp.newVote(buildEVMScript(formData, api3Agent), buildExtendedMetadata(formData), true, true);
  };

  return (
    <Layout title="Governance" sectionTitle="Governance">
      <div className="proposals-header">
        {/* TODO: Should the buttons be disabled according to conditions in https://api3workspace.slack.com/archives/C020RCCC3EJ/p1622114047033800?thread_ts=1622113523.033100&cid=C020RCCC3EJ */}
        {/* There was another slack discussion where we said we want to avoid disabled buttons */}
        {proposalState?.delegation.delegate ? (
          <div>
            <p className="secondary-color bold">Delegated to: {proposalState.delegation.delegate}</p>
            <Button className="proposals-link" type="text" onClick={() => setOpenDelegationModal(true)}>
              Update delegation
            </Button>
            <Button className="proposals-link space-left" type="text" onClick={() => setOpenUndelegateModal(true)}>
              Undelegate
            </Button>
            <Modal open={openUndelegateModal} onClose={() => setOpenUndelegateModal(false)}>
              <UndelegateForm onClose={() => setOpenUndelegateModal(false)} />
            </Modal>
          </div>
        ) : (
          <div>
            <p className="secondary-color bold">Undelegated</p>
            <Button className="proposals-link" type="text" onClick={() => setOpenDelegationModal(true)}>
              Update delegation
            </Button>
          </div>
        )}
        <Modal open={openDelegationModal} onClose={() => setOpenDelegationModal(false)}>
          <DelegateVotesForm onClose={() => setOpenDelegationModal(false)} />
        </Modal>

        <Treasury />
      </div>

      <BorderedBox
        header={
          <div className="bordered-box-header">
            <h5>Proposals</h5>
            <Button onClick={() => setOpenNewProposalModal(true)}>New proposal</Button>
          </div>
        }
        content={<ProposalList />}
      />
      <Modal open={openNewProposalModal} onClose={() => setOpenNewProposalModal(false)} size="large">
        <NewProposalForm
          onClose={() => setOpenNewProposalModal(false)}
          onConfirm={(formData) => {
            onCreateProposal(formData);
            setOpenNewProposalModal(false);
          }}
        />
      </Modal>
    </Layout>
  );
};

export default Proposals;
