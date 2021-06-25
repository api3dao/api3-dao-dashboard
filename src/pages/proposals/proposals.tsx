import { useState } from 'react';
import Button from '../../components/button/button';
import Layout from '../../components/layout/layout';
import { Modal } from '../../components/modal/modal';
import BorderedBox, { Header } from '../../components/bordered-box/bordered-box';
import TooltipChecklist from '../../components/tooltip/tooltip-checklist';
import Treasury from '../proposal-commons/treasury/treasury';
import { useApi3Token, useApi3Voting, useApi3AgentAddresses } from '../../contracts';
import { useActiveProposals, useLoadGenesisEpoch } from '../../logic/proposals/hooks';
import { encodeEvmScript, encodeMetadata, NewProposalFormData } from '../../logic/proposals/encoding';
import ProposalList from '../proposal-commons/proposal-list';
import NewProposalForm from './forms/new-proposal-form';
import { useTreasuryAndDelegation } from '../../logic/treasury-and-delegation/use-treasury-and-delegation';
import {
  openProposalsSelector,
  canCreateNewProposalSelector,
  genesisEpochOverSelector,
  votingPowerThresholdSelector,
} from '../../logic/proposals/selectors';
import Delegation from './delegation';
import { useChainData } from '../../chain-data';
import { useLoadDashboardData } from '../../logic/dashboard';
import { notifications } from '../../components/notifications/notifications';
import { formatApi3, go, images, isUserRejection, messages } from '../../utils';
import styles from './proposals.module.scss';

const Proposals = () => {
  // TODO: Retrieve only "userVotingPower" from the chain instead of loading all staking data (and remove useLoadDashboardData call)
  const chainData = useChainData();
  const { proposals, delegation, dashboardState, transactions, setChainData } = chainData;
  const api3Voting = useApi3Voting();
  const api3Token = useApi3Token();
  const api3Agent = useApi3AgentAddresses();

  const [openNewProposalModal, setOpenNewProposalModal] = useState(false);

  useLoadDashboardData();
  useLoadGenesisEpoch();

  useActiveProposals();
  useTreasuryAndDelegation();

  const sortedProposals = openProposalsSelector(proposals);
  const isGenesisEpochOver = genesisEpochOverSelector(chainData);
  const createNewProposal = canCreateNewProposalSelector(delegation, dashboardState);
  const votingThresholdPercent = votingPowerThresholdSelector(delegation);

  const newProposalChecklistItems = [
    {
      checked: createNewProposal?.lastProposalEpochOver ?? false,
      label: "You haven't voted in the last 7 days.",
    },
    {
      checked: createNewProposal?.hasEnoughVotingPower ?? false,
      label: votingThresholdPercent
        ? `You need at least ${formatApi3(
            votingThresholdPercent
          )}% of the total vote representation to post a proposal.`
        : 'You need to have enough voting power.',
    },
    {
      checked: isGenesisEpochOver,
      label: 'The genesis epoch has completed.',
    },
  ];

  // The button should always be in sync with the checklist
  const canCreateNewProposal = newProposalChecklistItems.every((item) => item.checked);

  const onCreateProposal = async (formData: NewProposalFormData) => {
    if (!api3Token || !api3Voting || !api3Agent) return null;

    // NOTE: For some reason only this 'ugly' version is available on the contract
    const [err, tx] = await go(
      api3Voting[formData.type]['newVote(bytes,string,bool,bool)'](
        encodeEvmScript(formData, api3Agent),
        encodeMetadata(formData),
        true,
        true
      )
    );

    if (err) {
      if (isUserRejection(err)) {
        notifications.info({ message: messages.TX_GENERIC_REJECTED });
        return;
      }
      notifications.error({ message: messages.TX_GENERIC_ERROR });
      return;
    }

    if (tx) {
      setChainData('Save new vote transaction', { transactions: [...transactions, { type: 'new-vote', tx }] });
    }

    setOpenNewProposalModal(false);
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
            <div>
              <Button onClick={() => setOpenNewProposalModal(true)} size="large" disabled={!canCreateNewProposal}>
                + New proposal
              </Button>
              <TooltipChecklist items={newProposalChecklistItems}>
                <img src={images.help} alt="new proposal help" className={styles.help} />
              </TooltipChecklist>
            </div>
          </Header>
        }
        content={<ProposalList proposals={sortedProposals} />}
        noMobileBorders
      />
      <Modal open={openNewProposalModal} onClose={() => setOpenNewProposalModal(false)} size="large">
        <NewProposalForm
          onClose={() => setOpenNewProposalModal(false)}
          onConfirm={onCreateProposal}
          api3Agent={api3Agent!}
        />
      </Modal>
    </Layout>
  );
};

export default Proposals;
