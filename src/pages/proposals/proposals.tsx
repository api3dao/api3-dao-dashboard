import { useState } from 'react';
import Button from '../../components/button';
import Layout from '../../components/layout';
import { Modal } from '../../components/modal';
import BorderedBox, { Header } from '../../components/bordered-box/bordered-box';
import { TooltipChecklist } from '../../components/tooltip';
import Treasury from '../components/treasury';
import { useApi3Token, useApi3Voting, useApi3AgentAddresses } from '../../contracts';
import { useLoadGenesisEpoch } from '../../logic/genesis-epoch';
import { goEncodeEvmScript, encodeMetadata, NewProposalFormData } from '../../logic/proposals/encoding';
import ProposalList, { EmptyState } from '../components/proposal-list';
import Pagination from '../../components/pagination';
import NewProposalForm from './forms/new-proposal-form';
import { useTreasuryAndDelegation } from '../../logic/treasury-and-delegation/use-treasury-and-delegation';
import { canCreateNewProposalSelector, votingPowerThresholdSelector } from '../../logic/proposals/selectors';
import Delegation from './delegation';
import { useChainData } from '../../chain-data';
import { useLoadDashboardData } from '../../logic/dashboard';
import { useProposals } from '../../logic/proposals/data';
import { formatApi3, handleTransactionError, images, round, useQueryParams } from '../../utils';
import { connectWallet } from '../../components/sign-in/sign-in';
import globalStyles from '../../styles/global-styles.module.scss';
import styles from './proposals.module.scss';

const Proposals = () => {
  // TODO: Retrieve only "userVotingPower" from the chain instead of loading all staking data (and remove useLoadDashboardData call)
  const { provider, delegation, dashboardState, isGenesisEpoch, transactions, setChainData } = useChainData();
  const api3Voting = useApi3Voting();
  const api3Token = useApi3Token();
  const api3Agent = useApi3AgentAddresses();

  const [openNewProposalModal, setOpenNewProposalModal] = useState(false);

  const params = useQueryParams();
  const currentPage = parseInt(params.get('page') || '') || 1;

  const { data, totalResults, status } = useProposals(currentPage, { open: true });

  useLoadDashboardData();
  useLoadGenesisEpoch();

  useTreasuryAndDelegation();

  const createNewProposal = canCreateNewProposalSelector(delegation, dashboardState, isGenesisEpoch);
  const votingThresholdPercent = votingPowerThresholdSelector(delegation);

  const thresholdPowerText = votingThresholdPercent ? formatApi3(votingThresholdPercent) : null;

  const votingPower = createNewProposal?.totalVotingPowerPercentage
    ? round(createNewProposal.totalVotingPowerPercentage, 2)
    : 0;

  const delegatedPowerText = createNewProposal?.delegatedVotingPowerPercentage
    ? ` (${round(createNewProposal.delegatedVotingPowerPercentage, 2)}% delegated)`
    : '';

  const proposalCooldownOver = createNewProposal?.lastProposalEpochOver ?? false;
  const newProposalChecklistItems = [
    {
      checked: proposalCooldownOver,
      label: (
        <>
          <div>You haven't created a proposal in the last 7 days.</div>
          {createNewProposal && !proposalCooldownOver && (
            <div className={styles.checklistHelperText}>
              {createNewProposal.lastProposalDeltaInDays > 0
                ? `Last proposal created ${createNewProposal.lastProposalDeltaInDays} days ago.`
                : `Last proposal created less than 24 hours ago.`}
            </div>
          )}
        </>
      ),
    },
    {
      checked: createNewProposal?.hasEnoughVotingPower ?? false,
      label: thresholdPowerText
        ? `You need at least ${thresholdPowerText}% of the total vote representation to post a proposal. You represent ${votingPower}% of the total voting power${delegatedPowerText}.`
        : 'You need to have enough voting power.',
    },
  ];

  // Only display this message during the genesis epoch
  if (!createNewProposal?.genesisEpochOver) {
    newProposalChecklistItems.unshift({ checked: false, label: 'The genesis epoch is over.' });
  }

  // The button should always be in sync with the checklist
  const canCreateNewProposal = newProposalChecklistItems.every((item) => item.checked);

  const onCreateProposal = async (formData: NewProposalFormData) => {
    if (!api3Token || !api3Voting || !api3Agent || !provider) return null;

    const goRes = await goEncodeEvmScript(provider, formData, api3Agent);
    // Should not happen, because user will not be allowed to press the create proposal button if there are errors
    if (!goRes.success) return null;

    const tx = await handleTransactionError(
      // NOTE: For some reason only this 'ugly' version is available on the contract
      api3Voting[formData.type]['newVote(bytes,string,bool,bool)'](goRes.data, encodeMetadata(formData), true, true)
    );
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
            <h5>Active Proposals</h5>
            <div>
              <Button onClick={() => setOpenNewProposalModal(true)} size="large" disabled={!canCreateNewProposal}>
                + New Proposal
              </Button>
              <TooltipChecklist items={newProposalChecklistItems}>
                <img src={images.help} alt="new proposal help" className={globalStyles.helpIcon} />
              </TooltipChecklist>
            </div>
          </Header>
        }
        content={
          !provider ? (
            <EmptyState>
              <span>You need to be connected to view proposals</span>
              <Button variant="link" onClick={connectWallet(setChainData)}>
                Connect your wallet
              </Button>
            </EmptyState>
          ) : data ? (
            <>
              {totalResults > 0 ? (
                <>
                  <ProposalList proposals={data} />
                  <Pagination totalResults={totalResults} currentPage={currentPage} className={styles.pagination} />
                </>
              ) : (
                <EmptyState>There are no active proposals</EmptyState>
              )}
            </>
          ) : (
            <EmptyState>{status === 'loading' && <p>Loading...</p>}</EmptyState>
          )
        }
        noMobileBorders
      />
      <Modal open={openNewProposalModal} onClose={() => setOpenNewProposalModal(false)} size="large">
        <NewProposalForm
          onClose={() => setOpenNewProposalModal(false)}
          onConfirm={onCreateProposal}
          api3Agent={api3Agent!}
          provider={provider!}
        />
      </Modal>
    </Layout>
  );
};

export default Proposals;
