import { ReactNode } from 'react';
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
import { useEvmScriptPreload, useCreatorNamePreload } from '../../../logic/proposals/preloading';
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
  useCreatorNamePreload(proposals);

  return (
    <ul className={styles.proposalList}>
      {proposals.map((proposal) => {
        const navlink = {
          base: proposal.open ? 'governance' : 'history',
          typeAndVoteId: encodeProposalTypeAndVoteId(proposal.type, proposal.voteId),
        };

        if ('deadline' in proposal) {
          const votingSliderData = voteSliderSelector(proposal);
          // Loaded list item
          return (
            <li className={styles.proposalItem} key={navlink.typeAndVoteId} data-cy="proposal-item">
              <div className={styles.proposalItemWrapper}>
                <ProposalInfoState proposal={proposal} device="mobile" />
                <p className={styles.proposalItemTitle}>
                  <NavLink to={`/${navlink.base}/${navlink.typeAndVoteId}`}>{proposal.metadata.title}</NavLink>
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
                  <NavLink to={`/${navlink.base}/${navlink.typeAndVoteId}`}>
                    <img src={images.arrowRight} alt="right arrow" />
                  </NavLink>
                </span>
              </div>
            </li>
          );
        }

        // Skeleton list item
        return (
          <li className={styles.skeletonItem} key={navlink.typeAndVoteId} data-cy="proposal-item">
            <div className={styles.proposalItemWrapper}>
              <div className={styles.infoSkeletonContainer}>
                <Skeleton />
              </div>
              <p className={styles.proposalItemTitle}>
                <NavLink to={`/${navlink.base}/${navlink.typeAndVoteId}`}>{proposal.metadata?.title}</NavLink>
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
                <NavLink to={`/${navlink.base}/${navlink.typeAndVoteId}`}>
                  <img src={images.arrowRight} alt="right arrow" />
                </NavLink>
              </span>
            </div>
          </li>
        );
      })}
    </ul>
  );
}

export function EmptyState(props: { children: ReactNode }) {
  return <div className={styles.noProposals}>{props.children}</div>;
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
