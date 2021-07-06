import { BigNumber, utils } from 'ethers';
import { useState } from 'react';
import { useParams } from 'react-router';
import { useHistory } from 'react-router-dom';
import classNames from 'classnames';
import { Proposal, ProposalType, useChainData, VOTER_STATES } from '../../../chain-data';
import { BaseLayout } from '../../../components/layout/layout';
import { Modal } from '../../../components/modal/modal';
import VoteSlider from '../vote-slider/vote-slider';
import VoteStatus from '../vote-status';
import Timer from '../../../components/timer/timer';
import Button from '../../../components/button/button';
import Tag from '../../../components/tag/tag';
import TooltipChecklist from '../../../components/tooltip/tooltip-checklist';
import BorderedBox, { Header } from '../../../components/bordered-box/bordered-box';
import { getEtherscanAddressUrl, useApi3Voting } from '../../../contracts';
import { decodeProposalTypeAndId, decodeEvmScript } from '../../../logic/proposals/encoding';
import { proposalDetailsSelector, voteSliderSelector } from '../../../logic/proposals/selectors';
import { useProposalsByIds } from '../../../logic/proposals/hooks';
import VoteForm from './vote-form/vote-form';
import ProposalStatus from '../proposal-list/proposal-status';
import globalStyles from '../../../styles/global-styles.module.scss';
import styles from './proposal-details.module.scss';
import { canVoteSelector } from '../../../logic/proposals/selectors';
import NotFoundPage from '../../not-found';
import { handleTransactionError, images, messages, useScrollToTop } from '../../../utils';
import ExternalLink from '../../../components/external-link';

interface ProposalDetailsContentProps {
  type: ProposalType;
  id: BigNumber;
}

const ProposalDetailsLayout = (props: ProposalDetailsContentProps) => {
  const { type, id } = props;
  const { proposals } = useChainData();

  // Need to memoize the id array to avoid infinite update loop
  useProposalsByIds(type, id);

  const proposal = proposalDetailsSelector(proposals, type, id);
  // TODO: Loading component
  return (
    <BaseLayout subtitle={`Proposal ${id.toString()}`}>
      {!proposal ? <p>Loading...</p> : <ProposalDetailsContent proposal={proposal} />}
    </BaseLayout>
  );
};

interface RouterParameters {
  typeAndId: string;
}

const ProposalDetailsPage = () => {
  useScrollToTop();
  const { typeAndId } = useParams<RouterParameters>();
  const decoded = decodeProposalTypeAndId(typeAndId);

  if (!decoded) return <NotFoundPage />;
  return <ProposalDetailsLayout {...decoded} />;
};

interface ProposalDetailsProps {
  proposal: Proposal;
}

const ProposalDetailsContent = (props: ProposalDetailsProps) => {
  const history = useHistory();
  const { chainId } = useChainData();
  const { proposal } = props;
  const [voteModalOpen, setVoteModalOpen] = useState(false);
  const { transactions, setChainData } = useChainData();
  const voting = useApi3Voting();

  const evmScriptData = decodeEvmScript(proposal.script, proposal.metadata);

  // NOTE: This should never happen, loading component in proposal details page should
  // make sure we are connected to valid chain
  if (!voting) return null;
  if (!evmScriptData) {
    return <p>{messages.INVALID_PROPOSAL_FORMAT}</p>;
  }

  const voteSliderData = voteSliderSelector(proposal);
  const canVoteData = canVoteSelector(proposal);
  const urlCreator = getEtherscanAddressUrl(chainId, proposal.creator);
  const urlTargetAddress = getEtherscanAddressUrl(chainId, evmScriptData.targetAddress);

  const canVoteChecklist = [
    {
      checked: canVoteData.hasEnoughVotingPower,
      label: 'You have staked API3 tokens.',
    },
    {
      checked: canVoteData.isOpen,
      label: 'The proposal has not ended.',
    },
    {
      checked: canVoteData.isNotDelegated,
      label: 'Your voting power has not been delegated to another address.',
    },
  ];

  const canVote = canVoteChecklist.every((item) => item.checked);

  return (
    <div>
      <div className={styles.proposalDetailsSubheader}>
        <Button onClick={() => history.goBack()} type="text" className={styles.backBtn}>
          <img src={images.arrowLeft} alt="back" />
          Back
        </Button>
      </div>

      <div className={styles.proposalDetailsHeader}>
        <div>
          <h4 className={styles.proposalDetailsTitle}>{proposal.metadata.title}</h4>
          <div className={styles.proposalTag}>
            <Tag type={proposal.type}>
              <span className={globalStyles.capitalize}>
                #{proposal.voteId.toString()} {proposal.type}
              </span>
            </Tag>
          </div>
        </div>
        <div className={styles.proposalDetailsTimer}>
          <Timer size="large" deadline={proposal.deadline} showDeadline />
        </div>
      </div>

      <ProposalStatus proposal={proposal} large />
      <div className={styles.proposalDetailsVoteSection}>
        <VoteSlider {...voteSliderData} size="large" />
        <VoteStatus voterState={voteSliderData.voterState} wasDelegated={voteSliderData.wasDelegated} large />
        <div>
          <Button type="secondary" size="large" onClick={() => setVoteModalOpen(true)} disabled={!canVote}>
            Vote
          </Button>
          <TooltipChecklist items={canVoteChecklist}>
            <img src={images.help} alt="voting help" className={globalStyles.helpIcon} />
          </TooltipChecklist>
        </div>
        {proposal.delegateAt && (
          <p className={styles.voteButtonHelperText}>
            {VOTER_STATES[voteSliderData.voterState] === 'Unvoted'
              ? 'Your voting power is delegated.'
              : 'Your delegate voted for you.'}
          </p>
        )}
        <Modal open={voteModalOpen} onClose={() => setVoteModalOpen(false)}>
          <VoteForm
            voteId={proposal.voteId.toString()}
            onConfirm={async (choice) => {
              setVoteModalOpen(false);
              const tx = await handleTransactionError(
                voting[proposal.type].vote(proposal.voteId, choice === 'for', true)
              );
              const type = choice === 'for' ? 'vote-for' : 'vote-against';
              if (tx) {
                setChainData('Save vote transaction', {
                  transactions: [...transactions, { tx, type }],
                });
              }
            }}
          />
        </Modal>
      </div>
      <BorderedBox
        header={
          <Header largeSpaces>
            <h5>Summary</h5>
          </Header>
        }
        content={
          <div className={styles.proposalDetailsSummary}>
            <p className={classNames(styles.proposalDetailsItem, globalStyles.secondaryColor)}>
              {proposal.metadata.description}
            </p>

            <div className={styles.proposalDetailsItem}>
              <p className={globalStyles.bold}>Discussion URL</p>
              {proposal.discussionUrl ? (
                <a href={proposal.discussionUrl} target="_blank" rel="noopener noreferrer">
                  {proposal.discussionUrl}
                </a>
              ) : (
                <p className={globalStyles.secondaryColor}>Discussion link has not been created yet</p>
              )}
            </div>

            <div className={styles.proposalDetailsItem}>
              <p className={globalStyles.bold}>Creator</p>
              <p className={classNames(globalStyles.secondaryColor, styles.address)}>
                {urlCreator ? <ExternalLink href={urlCreator}>{proposal.creator}</ExternalLink> : proposal.creator}
              </p>
            </div>
            <div className={styles.proposalDetailsItem}>
              <p className={globalStyles.bold}>Target Contract Address</p>
              <p className={classNames(globalStyles.secondaryColor, styles.address)}>
                {urlTargetAddress ? (
                  <ExternalLink href={urlTargetAddress}>{evmScriptData.targetAddress}</ExternalLink>
                ) : (
                  evmScriptData.targetAddress
                )}
              </p>
            </div>
            <div className={styles.proposalDetailsItem}>
              <p className={globalStyles.bold}>Target Contract Signature</p>
              <p className={globalStyles.secondaryColor}>{proposal.metadata.targetSignature}</p>
            </div>
            {evmScriptData.value.gt(0) && (
              <div className={styles.proposalDetailsItem}>
                <p className={globalStyles.bold}>ETH Value</p>
                <p className={globalStyles.secondaryColor}>{utils.formatEther(evmScriptData.value)}</p>
              </div>
            )}
            <div className={styles.proposalDetailsItem}>
              <p className={globalStyles.bold}>Parameters</p>
              <p className={classNames(globalStyles.secondaryColor, styles.multiline)}>
                {JSON.stringify(evmScriptData.parameters, null, 2)}
              </p>
            </div>
          </div>
        }
        noMobileBorders
      />
    </div>
  );
};

export default ProposalDetailsPage;
