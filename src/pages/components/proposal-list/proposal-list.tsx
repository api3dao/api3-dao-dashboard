import { ReactNode } from 'react';
import { Address, useEnsName } from 'wagmi';
import classNames from 'classnames';
import { NavLink } from 'react-router-dom';
import { format } from 'date-fns';
import { Proposal } from '../../../chain-data';
import { images } from '../../../utils';
import VoteSlider from '../vote-slider/vote-slider';
import Timer, { DATE_FORMAT } from '../../../components/timer';
import { Tooltip } from '../../../components/tooltip';
import Tag from '../../../components/tag';
import Skeleton from '../../../components/skeleton';
import ProposalStatus from './proposal-status/proposal-status';
import { encodeProposalTypeAndVoteId } from '../../../logic/proposals/encoding';
import { voteSliderSelector } from '../../../logic/proposals/selectors';
import { useEvmScriptPreload } from '../../../logic/proposals/preloading';
import { ProposalSkeleton } from '../../../logic/proposals/types';
import globalStyles from '../../../styles/global-styles.module.scss';
import styles from './proposal-list.module.scss';

interface Props {
  proposals: (ProposalSkeleton | Proposal)[];
}

export default function ProposalList(props: Props) {
  const { proposals } = props;

  // Preload for the Proposal Details page
  useEvmScriptPreload(proposals);

  return (
    <ul className={styles.proposalList}>
      {proposals.map((proposal) => {
        const typeAndVoteId = encodeProposalTypeAndVoteId(proposal.type, proposal.voteId);
        const href = `/${proposal.open ? 'governance' : 'history'}/${typeAndVoteId}`;

        if ('deadline' in proposal) {
          // Loaded list item
          return <ProposalListItem key={typeAndVoteId} proposal={proposal} href={href} />;
        }

        return <SkeletonListItem key={typeAndVoteId} proposal={proposal} href={href} />;
      })}
    </ul>
  );
}

interface ProposalListItemProps {
  proposal: Proposal;
  href: string;
}

function ProposalListItem(props: ProposalListItemProps) {
  const { proposal, href } = props;
  const votingSliderData = voteSliderSelector(proposal);

  // Preload proposal creator ENS name
  useEnsName({ address: proposal.creator as Address });

  return (
    <li className={styles.proposalItem} data-cy="proposal-item">
      <div className={styles.proposalItemWrapper}>
        <ProposalInfoState proposal={proposal} device="mobile" />
        <p className={styles.proposalItemTitle}>
          <NavLink to={href}>{proposal.metadata.title}</NavLink>
        </p>
        <div className={styles.proposalItemSubtitle}>
          <ProposalInfoState proposal={proposal} device="desktop" />
          <div className={styles.proposalItemBox}>
            {/* TODO: Probably show deadline instead of startDate, see: https://api3workspace.slack.com/archives/C020RCCC3EJ/p1622639292015100?thread_ts=1622620763.004400&cid=C020RCCC3EJ */}
            {proposal.open ? <Timer deadline={proposal.deadline} /> : format(proposal.startDate, DATE_FORMAT)}
          </div>
        </div>
      </div>

      <div className={styles.proposalVoteBar}>
        <VoteSlider {...votingSliderData} />
        <span className={styles.proposalVoteArrow}>
          <NavLink to={href}>
            <img src={images.arrowRight} alt="right arrow" />
          </NavLink>
        </span>
      </div>
    </li>
  );
}

interface SkeletonListItemProps {
  proposal: ProposalSkeleton;
  href: string;
}

function SkeletonListItem(props: SkeletonListItemProps) {
  const { proposal, href } = props;

  return (
    <li className={styles.skeletonItem} data-cy="proposal-item">
      <div className={styles.proposalItemWrapper}>
        <div className={styles.infoSkeletonContainer}>
          <Skeleton />
        </div>
        <p className={styles.proposalItemTitle}>
          <NavLink to={href}>{proposal.metadata?.title}</NavLink>
        </p>
        <div className={styles.subtitleSkeletonContainer}>
          <Skeleton />
        </div>
      </div>

      <div className={styles.proposalVoteBar}>
        <div className={styles.voteSkeletonContainer}>
          <Skeleton className={styles.sliderSkeleton} />
          <Skeleton />
        </div>
        <span className={styles.proposalVoteArrow}>
          <NavLink to={href}>
            <img src={images.arrowRight} alt="right arrow" />
          </NavLink>
        </span>
      </div>
    </li>
  );
}

interface ProposalInfoStateProps {
  proposal: Proposal;
  device: 'mobile' | 'desktop';
}

function ProposalInfoState({ proposal, device }: ProposalInfoStateProps) {
  const tooltipContent =
    proposal.type === 'primary'
      ? `Primary-type proposals need ${proposal.minAcceptQuorum}% quorum to pass`
      : `Secondary-type proposals need ${proposal.minAcceptQuorum}% quorum to pass`;

  const proposalId = `#${proposal.voteId} ${proposal.type}`;

  return (
    <div
      className={classNames(styles.proposalItemBox, {
        [styles.desktop]: device === 'desktop',
        [styles.mobile]: device === 'mobile',
      })}
    >
      <ProposalStatus proposal={proposal} />
      <div className={styles.proposalItemTag}>
        <Tooltip overlay={tooltipContent}>
          <span>
            <Tag type={proposal.type}>
              <span className={globalStyles.capitalize}>{proposalId}</span>
            </Tag>
          </span>
        </Tooltip>
      </div>
    </div>
  );
}

export function EmptyState(props: { children: ReactNode }) {
  return <div className={styles.noProposals}>{props.children}</div>;
}
