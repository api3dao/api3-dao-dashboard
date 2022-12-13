import { BigNumber } from 'ethers';
import { useEffect, useMemo, useState } from 'react';
import { useParams } from 'react-router';
import classNames from 'classnames';
import { produceState, Proposal, ProposalType, useChainData, VOTER_STATES } from '../../../chain-data';
import { BaseLayout } from '../../../components/layout';
import { Modal } from '../../../components/modal';
import VoteSlider from '../vote-slider/vote-slider';
import VoteStatus from '../vote-status';
import Timer from '../../../components/timer';
import Button from '../../../components/button';
import BackButton from '../../../components/back-button';
import Tag from '../../../components/tag';
import { TooltipChecklist } from '../../../components/tooltip';
import BorderedBox, { Header } from '../../../components/bordered-box/bordered-box';
import { getEtherscanAddressUrl, useApi3AgentAddresses, useApi3Voting, useChainUpdateEffect } from '../../../contracts';
import { decodeProposalTypeAndVoteId, isEvmScriptValid } from '../../../logic/proposals/encoding';
import { voteSliderSelector } from '../../../logic/proposals/selectors';
import VoteForm from './vote-form/vote-form';
import ProposalStatus from '../proposal-list/proposal-status';
import globalStyles from '../../../styles/global-styles.module.scss';
import styles from './proposal-details.module.scss';
import { canVoteSelector } from '../../../logic/proposals/selectors';
import NotFoundPage from '../../not-found';
import { handleTransactionError, images, messages, useScrollToTop } from '../../../utils';
import ExternalLink from '../../../components/external-link';
import WarningIcon from '../../../components/icons/warning-icon';
import { useProposalById } from '../../../logic/proposals/data';
import { convertToEnsName } from '../../../logic/proposals/encoding/ens-name';

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
  voteId: string;
}

const ProposalDetailsLayout = (props: ProposalDetailsContentProps) => {
  const { type, voteId } = props;
  const { provider } = useChainData();

  const { data, status } = useProposalById(type, voteId);

  if (!provider) {
    return (
      <BaseLayout subtitle={`Proposal ${voteId}`}>
        <p>Please connect your wallet to see the proposal details.</p>
      </BaseLayout>
    );
  }

  return (
    <BaseLayout subtitle={`Proposal ${voteId}`}>
      {data ? (
        <ProposalDetailsContent proposal={data} />
      ) : status === 'loading' ? (
        <p className={globalStyles.secondaryColor}>Loading...</p>
      ) : status === 'loaded' ? (
        <p>Could not find the proposal with given id.</p>
      ) : null}
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
  proposal: Proposal;
}

const ProposalDetailsContent = (props: ProposalDetailsProps) => {
  const { chainId } = useChainData();
  const { proposal } = props;
  const isMalicious = useMaliciousProposalCheck(proposal);
  const [voteModalOpen, setVoteModalOpen] = useState(false);
  const { transactions, setChainData } = useChainData();
  const voting = useApi3Voting()!;

  const creatorName = useEnsName(proposal.creator);

  if (!proposal.decodedEvmScript) {
    return <p>{messages.INVALID_PROPOSAL_FORMAT}</p>;
  }

  const { parameters, targetAddress, value } = proposal.decodedEvmScript;
  const voteSliderData = voteSliderSelector(proposal);
  const canVoteData = canVoteSelector(proposal);
  const urlCreator = getEtherscanAddressUrl(chainId, proposal.creator);
  const urlTargetAddress = getEtherscanAddressUrl(chainId, targetAddress);

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
      <div className={styles.backButtonRow}>
        <BackButton fallback={{ href: proposal.open ? '/governance' : '/history' }}>Back</BackButton>
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
          <Button variant="secondary" size="large" onClick={() => setVoteModalOpen(true)} disabled={!canVote}>
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
                voting[proposal.type].vote(BigNumber.from(proposal.voteId), choice === 'for', true)
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
                    {creatorName || proposal.creator}
                  </ExternalLink>
                ) : (
                  proposal.creator
                )}
              </p>
            </div>
            <div className={styles.proposalDetailsItem}>
              <p className={globalStyles.bold}>Target Contract Address</p>
              <p className={classNames(globalStyles.secondaryColor, styles.address)}>
                {urlTargetAddress ? (
                  <ExternalLink className={styles.link} href={urlTargetAddress}>
                    {targetAddress}
                  </ExternalLink>
                ) : (
                  targetAddress
                )}
              </p>
            </div>
            <div className={styles.proposalDetailsItem}>
              <p className={globalStyles.bold}>Target Contract Signature</p>
              <p className={globalStyles.secondaryColor}>{proposal.metadata.targetSignature}</p>
            </div>
            {value.gt(0) && (
              <div className={styles.proposalDetailsItem}>
                <p className={globalStyles.bold}>Value (Wei)</p>
                <p className={globalStyles.secondaryColor}>{value.toString()}</p>
              </div>
            )}
            <div className={styles.proposalDetailsItem}>
              <p className={globalStyles.bold}>Parameters</p>
              <p className={classNames(globalStyles.secondaryColor, styles.multiline)}>
                {JSON.stringify(parameters, null, 2)}
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

function useEnsName(address: string) {
  const { ensNamesByAddress, provider, setChainData } = useChainData();
  const ensName = ensNamesByAddress[address];

  useChainUpdateEffect(() => {
    if (!provider || ensName !== undefined) return;

    const load = async () => {
      const result = await convertToEnsName(provider, address);

      setChainData(
        'Loaded ENS name',
        produceState((draft) => {
          draft.ensNamesByAddress[address] = result;
        })
      );
    };

    load();
  }, [provider, address, ensName, setChainData]);

  return ensName;
}
