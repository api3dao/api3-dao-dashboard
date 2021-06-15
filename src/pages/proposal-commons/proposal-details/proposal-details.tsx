import { useMemo, useState } from 'react';
import { useParams } from 'react-router';
import { Proposal, useChainData } from '../../../chain-data';
import { BaseLayout } from '../../../components/layout/layout';
import { Modal } from '../../../components/modal/modal';
import VoteSlider from '../vote-slider/vote-slider';
import Timer from '../../../components/timer/timer';
import Button from '../../../components/button/button';
import Tag from '../../../components/tag/tag';
import BorderedBox, { Header } from '../../../components/bordered-box/bordered-box';
import { useApi3Voting } from '../../../contracts';
import { decodeProposalTypeAndId, decodeEvmScript } from '../../../logic/proposals/encoding';
import { proposalDetailsSelector, voteSliderSelector } from '../../../logic/proposals/selectors';
import { useProposalsByIds } from '../../../logic/proposals/hooks';
import VoteForm from './vote-form/vote-form';
import ProposalStatus from '../proposal-list/proposal-status';
import globalStyles from '../../../styles/global-styles.module.scss';
import styles from './proposal-details.module.scss';
import classNames from 'classnames';
import { BigNumber } from '@ethersproject/bignumber';

interface RouterParameters {
  typeAndId: string;
}

const ProposalDetailsPage = () => {
  const { typeAndId } = useParams<RouterParameters>();
  // TODO: Validate id and type - a proposal might not exist (e.g. user tries invalid voteId)
  const { id, type } = decodeProposalTypeAndId(typeAndId);
  const { proposals } = useChainData();

  // Need to memoize the id array to avoid infinite update loop
  const memoizedId = useMemo(() => [BigNumber.from(id)], [id]);
  useProposalsByIds(type, memoizedId);

  const proposal = proposalDetailsSelector(proposals, type, id);
  // TODO: Loading component
  return <BaseLayout>{!proposal ? <p>Loading...</p> : <ProposalDetails proposal={proposal} />}</BaseLayout>;
};

interface ProposalDetailsProps {
  proposal: Proposal;
}

const ProposalDetails = (props: ProposalDetailsProps) => {
  const { proposal } = props;
  const [voteModalOpen, setVoteModalOpen] = useState(false);
  const { transactions, setChainData } = useChainData();
  const voting = useApi3Voting();

  const voteSliderData = voteSliderSelector(proposal);
  const evmScriptData = decodeEvmScript(proposal.script, proposal.metadata);

  // NOTE: This should never happen, loading component in proposal details page should
  // make sure we are connected to valid chain and have valid proposal loaded
  if (!voting) return null;

  return (
    <div>
      <div className={styles.proposalDetailsSubheader}>
        <p className={`${globalStyles.tertiaryColor} ${globalStyles.medium}`}>#{proposal.voteId.toString()}</p>
        <Tag type={proposal.type}>
          <span className={globalStyles.capitalize}>{proposal.type}</span>
        </Tag>
      </div>
      <div className={styles.proposalDetailsHeader}>
        <p className={styles.proposalDetailsTitle}>{proposal.metadata.title}</p>
        <div className={styles.proposalDetailsTimer}>
          <Timer size="large" deadline={proposal.deadline} showDeadline />
        </div>
      </div>
      <ProposalStatus proposal={proposal} large />
      <div className={styles.proposalDetailsVoteSection}>
        <VoteSlider {...voteSliderData} size="large" />
        <Button type="secondary" size="large" onClick={() => setVoteModalOpen(true)}>
          Vote
        </Button>
        <Modal open={voteModalOpen} onClose={() => setVoteModalOpen(false)}>
          <VoteForm
            voteId={proposal.voteId.toString()}
            onConfirm={async (choice) => {
              setVoteModalOpen(false);
              // TODO: handle error
              const tx = await voting[proposal.type].vote(proposal.voteId, choice === 'for', true);
              const type = choice === 'for' ? 'vote-for' : 'vote-against';
              setChainData('Save vote transaction', { transactions: [...transactions, { tx, type }] });
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
              <p className={globalStyles.bold}>Target contract address</p>
              <p className={classNames(globalStyles.secondaryColor, styles.address)}>{evmScriptData.targetAddress}</p>
            </div>
            <div className={styles.proposalDetailsItem}>
              <p className={globalStyles.bold}>Target contract signature</p>
              <p className={globalStyles.secondaryColor}>{proposal.metadata.targetSignature}</p>
            </div>
            <div className={styles.proposalDetailsItem}>
              <p className={globalStyles.bold}>Value</p>
              <p className={globalStyles.secondaryColor}>{evmScriptData.value}</p>
            </div>
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
