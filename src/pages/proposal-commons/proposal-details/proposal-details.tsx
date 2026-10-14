import { BigNumber, utils } from 'ethers';
import { useEffect, useMemo, useState } from 'react';
import { useEnsName, Address } from 'wagmi';
import { useParams } from 'react-router-dom';
import { Link } from 'react-router-dom';
import classNames from 'classnames';
import { Proposal, ProposalType, useChainData, VOTER_STATES } from '../../../chain-data';
import { BaseLayout } from '../../../components/layout';
import VoteSlider from '../vote-slider/vote-slider';
import VoteStatus from '../vote-status';
import Timer from '../../../components/timer';
import ProposalTag from '../proposal-tag';
import { getEtherscanAddressUrl, useApi3AgentAddresses, useApi3Voting } from '../../../contracts';
import { decodeProposalTypeAndVoteId, isEvmScriptValid } from '../../../logic/proposals/encoding';
import { proposalDetailsSelector, voteSliderSelector } from '../../../logic/proposals/selectors';
import { useProposalById } from '../../../logic/proposals/hooks';
import ProposalStatus from '../proposal-list/proposal-status';
import styles from './proposal-details.module.scss';
import NotFoundPage from '../../not-found';
import { images, messages, useScrollToTop } from '../../../utils';
import ExternalLink from '../../../components/external-link';
import { ErrorCircleFillIcon } from '../../../components/icons';
import { DisconnectedProposalPage } from './disconnected-proposal-page';

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
  const { chainId } = useChainData();
  const { proposal } = props;
  const isMalicious = useMaliciousProposalCheck(typeof proposal === 'string' ? null : proposal);
  const voting = useApi3Voting();

  if (!voting || proposal === 'user not signed in') return <DisconnectedProposalPage />;
  if (proposal === 'does not exist') return <>Proposal with such id hasn't been created yet...</>;

  const { decodedEvmScript } = proposal;

  if (!decodedEvmScript) {
    return <p>{messages.INVALID_PROPOSAL_FORMAT}</p>;
  }

  const voteSliderData = voteSliderSelector(proposal);
  const urlCreator = getEtherscanAddressUrl(chainId, proposal.creator);
  const urlTargetAddress = getEtherscanAddressUrl(chainId, decodedEvmScript.targetAddress);

  return (
    <div>
      <div className={styles.proposalDetailsSubheader}>
        <Link to="/governance-history" className={styles.backBtn} data-cy="back-button">
          <img src={images.arrowLeft} alt="back" />
          Back
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
        {proposal.delegateAt && (
          <p className={styles.voteButtonHelperText}>
            {VOTER_STATES[voteSliderData.voterState] === 'Unvoted'
              ? 'Your voting power is delegated.'
              : 'Your delegate voted for you.'}
          </p>
        )}
      </div>

      <div className={styles.summary}>
        <h5>Summary</h5>
        <div className={classNames(styles.proposalDetailsItem)}>
          <ProposalDescription description={proposal.metadata.description} />
        </div>

        <div className={styles.proposalDetailsItem}>
          <p className={styles.label}>Creator</p>
          <p>
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
          <p>
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
