import { BigNumber, utils } from 'ethers';
import { ComponentProps, useEffect, useMemo, useState } from 'react';
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
import Tag from '../../../components/tag';
import { TooltipChecklist } from '../../../components/tooltip';
import BorderedBox, { Header } from '../../../components/bordered-box/bordered-box';
import { getEtherscanAddressUrl, useApi3AgentAddresses, useApi3Voting } from '../../../contracts';
import { decodeProposalTypeAndVoteId, isEvmScriptValid } from '../../../logic/proposals/encoding';
import { proposalDetailsSelector, voteSliderSelector } from '../../../logic/proposals/selectors';
import { useProposalById } from '../../../logic/proposals/hooks';
import VoteForm from './vote-form/vote-form';
import ProposalStatus from '../proposal-list/proposal-status';
import globalStyles from '../../../styles/global-styles.module.scss';
import styles from './proposal-details.module.scss';
import { canVoteSelector } from '../../../logic/proposals/selectors';
import NotFoundPage from '../../not-found';
import { handleTransactionError, images, messages, useScrollToTop } from '../../../utils';
import ExternalLink from '../../../components/external-link';

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
    <BaseLayout subtitle={`Proposal ${voteId.toString()}`}>
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
    text: `Back to ${proposal.open ? 'Governance' : 'History'}`,
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
        <Link to={backButton.url} data-cy="api3-logo">
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

      {isMalicious && (
        <div className={styles.malicious}>
          <WarningIcon aria-hidden />
          <p>
            <b>This proposal is potentially malicious.</b> A suspicious EVM script has been detected.
          </p>
        </div>
      )}

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
      <BorderedBox
        header={
          <Header largeSpaces>
            <h5>Summary</h5>
          </Header>
        }
        content={
          <div className={styles.proposalDetailsSummary}>
            <pre className={classNames(styles.proposalDetailsItem, globalStyles.secondaryColor, styles.scrollX)}>
              <ProposalDescription description={proposal.metadata.description} />
            </pre>

            <div className={styles.proposalDetailsItem}>
              <p className={globalStyles.bold}>Creator</p>
              <p className={classNames(globalStyles.secondaryColor, styles.address)}>
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
              <p className={globalStyles.bold}>Target Address</p>
              <p className={classNames(globalStyles.secondaryColor, styles.address)}>
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
                <p className={globalStyles.bold}>Target Contract Signature</p>
                <p className={globalStyles.secondaryColor}>{proposal.metadata.targetSignature}</p>
              </div>
            )}
            {decodedEvmScript.value.gt(0) && (
              <div className={styles.proposalDetailsItem}>
                <p className={globalStyles.bold}>Value (Wei)</p>
                <p className={globalStyles.secondaryColor}>{decodedEvmScript.value.toString()}</p>
              </div>
            )}
            <div className={styles.proposalDetailsItem}>
              <p className={globalStyles.bold}>Parameters</p>
              <div className={classNames(globalStyles.secondaryColor, styles.multiline)}>
                <Parameters parameters={decodedEvmScript.parameters} />
              </div>
            </div>
          </div>
        }
        noMobileBorders
      />
    </div>
  );
};

export default ProposalDetailsPage;

// TODO Move into ~/components/icons folder
function WarningIcon(props: ComponentProps<'svg'>) {
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" {...props}>
      <path
        d="M12 1.5C6.20156 1.5 1.5 6.20156 1.5 12C1.5 17.7984 6.20156 22.5 12 22.5C17.7984 22.5 22.5 17.7984 22.5 12C22.5 6.20156 17.7984 1.5 12 1.5ZM12 20.7188C7.18594 20.7188 3.28125 16.8141 3.28125 12C3.28125 7.18594 7.18594 3.28125 12 3.28125C16.8141 3.28125 20.7188 7.18594 20.7188 12C20.7188 16.8141 16.8141 20.7188 12 20.7188Z"
        fill="currentColor"
      />
      <path
        d="M10.875 16.125C10.875 16.4234 10.9935 16.7095 11.2045 16.9205C11.4155 17.1315 11.7016 17.25 12 17.25C12.2984 17.25 12.5845 17.1315 12.7955 16.9205C13.0065 16.7095 13.125 16.4234 13.125 16.125C13.125 15.8266 13.0065 15.5405 12.7955 15.3295C12.5845 15.1185 12.2984 15 12 15C11.7016 15 11.4155 15.1185 11.2045 15.3295C10.9935 15.5405 10.875 15.8266 10.875 16.125ZM11.4375 13.5H12.5625C12.6656 13.5 12.75 13.4156 12.75 13.3125V6.9375C12.75 6.83437 12.6656 6.75 12.5625 6.75H11.4375C11.3344 6.75 11.25 6.83437 11.25 6.9375V13.3125C11.25 13.4156 11.3344 13.5 11.4375 13.5Z"
        fill="currentColor"
      />
    </svg>
  );
}

function EnsName(props: { address: Address }) {
  const { address } = props;
  const { data } = useEnsName({
    address,
    onError(error) {
      // eslint-disable-next-line no-console
      console.error(error);
    },
  });

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
