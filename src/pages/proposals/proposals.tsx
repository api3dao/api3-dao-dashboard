import { ethers } from 'ethers';
import { useState } from 'react';
import { useChainData } from '../../chain-data';
import Button from '../../components/button/button';
import Layout from '../../components/layout/layout';
import { Modal } from '../../components/modal/modal';
import BorderedBox, { Header } from '../../components/bordered-box/bordered-box';
import Treasury from '../proposal-commons/treasury/treasury';
import { useApi3Token, useApi3Voting, useApi3AgentAddresses } from '../../contracts';
import { useLoadAllProposals, useReloadActiveProposalsOnMinedBlock } from '../../logic/proposals/hooks';
import { buildEVMScript, buildExtendedMetadata, NewProposalFormData } from '../../logic/proposals/encoding';
import ProposalList from '../proposal-commons/proposal-list';
import NewProposalForm from './forms/new-proposal-form';
import { useTreasuryAndDelegation } from '../../logic/treasury-and-delegation/use-treasury-and-delegation';
import { openProposalsSelector } from '../../logic/proposals/selectors';
import styles from './proposals.module.scss';
import Delegation from './delegation';

const Proposals = () => {
  const { provider, proposals } = useChainData();
  const api3Voting = useApi3Voting();
  const api3Token = useApi3Token();
  const api3Agent = useApi3AgentAddresses();

  const [openNewProposalModal, setOpenNewProposalModal] = useState(false);

  useLoadAllProposals();
  useReloadActiveProposalsOnMinedBlock();
  useTreasuryAndDelegation();

  const sortedProposals = openProposalsSelector(proposals);

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
    <Layout title="Governance">
      <div className={styles.proposalsHeader}>
        <Delegation />
        <Treasury />
      </div>

      <BorderedBox
        header={
          <Header>
            <h5>Proposals</h5>
            <Button onClick={() => setOpenNewProposalModal(true)} size="large">
              + New proposal
            </Button>
          </Header>
        }
        content={<ProposalList proposals={sortedProposals} />}
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
