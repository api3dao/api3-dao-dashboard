import { ReactNode } from 'react';
import classNames from 'classnames';
import { NavLink } from 'react-router-dom';
import { format } from 'date-fns';
import { Proposal } from '../../../chain-data';
import { images } from '../../../utils';
import { encodeProposalTypeAndVoteId } from '../../../logic/proposals/encoding';
import VoteSlider from '../vote-slider/vote-slider';
import Timer, { DATE_FORMAT } from '../../../components/timer';
import { Tooltip } from '../../../components/tooltip';
import { voteSliderSelector } from '../../../logic/proposals/selectors';
import Tag from '../../../components/tag';
import globalStyles from '../../../styles/global-styles.module.scss';
import styles from './proposal-list.module.scss';
import ProposalStatus from './proposal-status/proposal-status';
import Skeleton from '../../../components/skeleton';
import { useEvmScriptPreload, useCreatorNamePreload } from '../../../logic/proposals/preloading';
import { ProposalSkeleton } from '../../../logic/proposals/types';

interface Props {
  proposals: (ProposalSkeleton | Proposal)[];
}

export default function ProposalList(props: Props) {
  const { proposals } = props;

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

        return (
          <li className={styles.proposalItem} key={navlink.typeAndVoteId} data-cy="proposal-item">
            <div className={styles.proposalItemWrapper}>
              <div className={styles.infoSkeletonContainer}>
                <Skeleton />
              </div>
              <p className={styles.proposalItemTitle} style={{ opacity: '0.7' }}>
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

interface ProposalProps {
  proposal: Proposal;
  device: 'mobile' | 'desktop';
}

const ProposalInfoState = ({ proposal, device }: ProposalProps) => {
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
};
