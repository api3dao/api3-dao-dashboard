import { useState } from 'react';
import Button from '../../components/button/button';
import Layout from '../../components/layout/layout';
import { Modal } from '../../components/modal/modal';
import BorderedBox, { Header } from '../../components/bordered-box/bordered-box';
import Treasury from '../proposal-commons/treasury/treasury';
import { useApi3Token, useApi3Voting, useApi3AgentAddresses } from '../../contracts';
import { useLoadAllProposals, useReloadActiveProposalsOnMinedBlock } from '../../logic/proposals/hooks';
import { encodeEvmScript, encodeMetadata, NewProposalFormData } from '../../logic/proposals/encoding';
import ProposalList from '../proposal-commons/proposal-list';
import NewProposalForm from './forms/new-proposal-form';
import { useTreasuryAndDelegation } from '../../logic/treasury-and-delegation/use-treasury-and-delegation';
import { openProposalsSelector } from '../../logic/proposals/selectors';
import styles from './proposals.module.scss';
import Delegation from './delegation';
import { useChainData } from '../../chain-data';

const Proposals = () => {
  const { proposals } = useChainData();
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

    // NOTE: For some reason only this 'ugly' version is available on the contract
    api3Voting[formData.type]['newVote(bytes,string,bool,bool)'](
      encodeEvmScript(formData, api3Agent),
      encodeMetadata(formData),
      true,
      true
    );
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
            <Button onClick={() => setOpenNewProposalModal(true)} size="large" disabled={!api3Agent}>
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
          api3Agent={api3Agent!}
        />
      </Modal>
    </Layout>
  );
};

export default Proposals;
