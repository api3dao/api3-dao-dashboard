import { BigNumber, utils } from 'ethers';
import { useEffect, useMemo, useState } from 'react';
import { useEnsName, Address } from 'wagmi';
import { useParams } from 'react-router';
import { Link } from 'react-router-dom';
import classNames from 'classnames';
import { Proposal, ProposalType, useChainData, VOTER_STATES } from '../../../chain-data';
import { BaseLayout } from '../../../components/layout';
import { Modal } from '../../../components/modal';
import VoteSlider from '../vote-slider/vote-slider';
import VoteStatus from '../vote-status';
import Timer from '../../../components/timer';
import Button from '../../../components/button';
import ProposalTag from '../proposal-tag';
import { TooltipChecklist } from '../../../components/tooltip';
import { getEtherscanAddressUrl, useApi3AgentAddresses, useApi3Voting } from '../../../contracts';
import { decodeProposalTypeAndVoteId, isEvmScriptValid } from '../../../logic/proposals/encoding';
import { proposalDetailsSelector, voteSliderSelector } from '../../../logic/proposals/selectors';
import { useProposalById } from '../../../logic/proposals/hooks';
import VoteForm from './vote-form/vote-form';
import ProposalStatus from '../proposal-list/proposal-status';
import styles from './proposal-details.module.scss';
import { canVoteSelector } from '../../../logic/proposals/selectors';
import NotFoundPage from '../../not-found';
import { handleTransactionError, images, messages, useScrollToTop } from '../../../utils';
import ExternalLink from '../../../components/external-link';
import { ErrorCircleFillIcon } from '../../../components/icons';

interface ProposalDescriptionProps {
  description: string;
}

const ProposalDescription = (props: ProposalDescriptionProps) => {
  const { description } = props;

  // The regex is intentionally simpler than usual URL checking regexes.
  //
  // The whole regex expression must be quoted, otherwise the delimeter (the URL) will be excluded.
  const parts = description.split(/(https?:\/\/[^\s]+)/g);
  return (
    <>
      {parts.map((part, i) => {
        if (i % 2 === 0) return part;
        else
          return (
            <ExternalLink className={styles.link} href={part} key={part}>
              {part}
            </ExternalLink>
          );
      })}
    </>
  );
};

interface ProposalDetailsContentProps {
  type: ProposalType;
  voteId: BigNumber;
}

const ProposalDetailsLayout = (props: ProposalDetailsContentProps) => {
  const { type, voteId } = props;
  const { proposals, provider } = useChainData();

  useProposalById(type, voteId);

  const proposal = proposalDetailsSelector(provider, proposals, type, voteId);
  return (
    <BaseLayout title={`Proposal ${voteId.toString()}`}>
      <ProposalDetailsContent proposal={proposal} />
    </BaseLayout>
  );
};

interface RouterParameters {
  typeAndVoteId: string;
}

const ProposalDetailsPage = () => {
  useScrollToTop();
  const { typeAndVoteId } = useParams<RouterParameters>();
  const decoded = useMemo(() => decodeProposalTypeAndVoteId(typeAndVoteId), [typeAndVoteId]);

  if (!decoded) return <NotFoundPage />;

  return <ProposalDetailsLayout {...decoded} />;
};

interface ProposalDetailsProps {
  proposal: Proposal | 'user not signed in' | 'does not exist';
}

const ProposalDetailsContent = (props: ProposalDetailsProps) => {
  const { chainId, signer } = useChainData();
  const { proposal } = props;
  const isMalicious = useMaliciousProposalCheck(typeof proposal === 'string' ? null : proposal);
  const [voteModalOpen, setVoteModalOpen] = useState(false);
  const { transactions, setChainData } = useChainData();
  const voting = useApi3Voting();

  // TODO: implement proper "not signed in" and "does not exist" pages
  if (!voting || proposal === 'user not signed in')
    return <>Please connect your wallet to see the proposal details...</>;
  if (proposal === 'does not exist') return <>Proposal with such id hasn't been created yet...</>;

  const { decodedEvmScript } = proposal;

  if (!decodedEvmScript) {
    return <p>{messages.INVALID_PROPOSAL_FORMAT}</p>;
  }

  const voteSliderData = voteSliderSelector(proposal);
  const canVoteData = canVoteSelector(proposal);
  const urlCreator = getEtherscanAddressUrl(chainId, proposal.creator);
  const urlTargetAddress = getEtherscanAddressUrl(chainId, decodedEvmScript.targetAddress);
  const backButton = {
    text: 'Back',
    url: proposal.open ? '/governance' : '/history',
  };

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
        <Link to={backButton.url} data-cy="back-button">
          <Button type="text" className={styles.backBtn}>
            <img src={images.arrowLeft} alt="back" />
            {backButton.text}
          </Button>
        </Link>
      </div>

      <div className={styles.proposalDetailsHeader}>
        <div>
          <h4 className={styles.proposalDetailsTitle}>{proposal.metadata.title}</h4>
          <div className={styles.proposalTag}>
            <ProposalTag type={proposal.type} id={`#${proposal.voteId.toString()}`} />
          </div>
        </div>
        <div className={styles.proposalDetailsTimer}>
          <Timer size="large" deadline={proposal.deadline} showDeadline />
        </div>
      </div>

      {isMalicious && (
        <div className={styles.malicious}>
          <ErrorCircleFillIcon />
          <div className={styles.warningText}>
            <div className={styles.warningTitle}>This proposal is potentially malicious.</div>
            <div className={styles.warningSubtitle}>A suspicious EVM script has been detected.</div>
          </div>
        </div>
      )}

      <ProposalStatus proposal={proposal} large />
      <div className={styles.proposalDetailsVoteSection}>
        <VoteSlider {...voteSliderData} size="large" />
        <VoteStatus voterState={voteSliderData.voterState} wasDelegated={voteSliderData.wasDelegated} large />
        <div className={styles.voteButtonWrapper}>
          <Button
            type="secondary"
            size="sm"
            md={{ size: 'lg' }}
            onClick={() => setVoteModalOpen(true)}
            disabled={!canVote}
          >
            Vote
          </Button>
          <TooltipChecklist items={canVoteChecklist}>
            <img src={images.helpOutline} alt="voting help" className={styles.helpIcon} />
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
                voting[proposal.type].connect(signer!).vote(proposal.voteId, choice === 'for', true)
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

      <div className={styles.summary}>
        <h5>Summary</h5>
        <div className={classNames(styles.proposalDetailsItem)}>
          <ProposalDescription description={proposal.metadata.description} />
        </div>

        <div className={styles.proposalDetailsItem}>
          <p className={styles.label}>Creator</p>
          <p className={styles.address}>
            {urlCreator ? (
              <ExternalLink className={styles.link} href={urlCreator}>
                <EnsName address={proposal.creator as Address} />
              </ExternalLink>
            ) : (
              proposal.creator
            )}
          </p>
        </div>
        <div className={styles.proposalDetailsItem}>
          <p className={styles.label}>Target Contract Address</p>
          <p className={styles.address}>
            {urlTargetAddress ? (
              <ExternalLink className={styles.link} href={urlTargetAddress}>
                <EnsName address={decodedEvmScript.targetAddress as Address} />
              </ExternalLink>
            ) : (
              decodedEvmScript.targetAddress
            )}
          </p>
        </div>
        {proposal.metadata.targetSignature && (
          <div className={styles.proposalDetailsItem}>
            <p className={styles.label}>Target Contract Signature</p>
            <p>{proposal.metadata.targetSignature}</p>
          </div>
        )}
        {decodedEvmScript.value.gt(0) && (
          <div className={styles.proposalDetailsItem}>
            <p className={styles.label}>Value (Wei)</p>
            <p>{decodedEvmScript.value.toString()}</p>
          </div>
        )}
        <div className={styles.proposalDetailsItem}>
          <p className={styles.label}>Parameters</p>
          <Parameters parameters={decodedEvmScript.parameters} />
        </div>
      </div>
    </div>
  );
};

export default ProposalDetailsPage;

function EnsName(props: { address: Address }) {
  const { address } = props;
  const { data } = useEnsName({ address });

  return <>{data || address}</>;
}

function Parameters(props: { parameters: unknown[] }) {
  const { parameters } = props;
  return (
    <>
      {'['}
      {parameters.map((param, index) => (
        <div key={index} style={{ paddingLeft: 9 }}>
          {typeof param === 'string' && utils.isAddress(param) ? (
            <>
              "<EnsName address={param as Address} />"
            </>
          ) : (
            JSON.stringify(param)
          )}
          {index < parameters.length - 1 && ','}
        </div>
      ))}
      {']'}
    </>
  );
}

function useMaliciousProposalCheck(proposal: Proposal | null) {
  const { provider } = useChainData();
  const agents = useApi3AgentAddresses();
  const [isMalicious, setIsMalicious] = useState(false);

  useEffect(() => {
    if (!provider || !agents || !proposal) return;

    isEvmScriptValid(provider, agents, proposal).then((valid) => {
      setIsMalicious(!valid);
    });
  }, [provider, agents, proposal]);

  return isMalicious;
}
