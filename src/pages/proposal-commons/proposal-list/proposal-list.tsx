import { BigNumber } from 'ethers';
import { Proposal } from '../../../chain-data';
import { NavLink } from 'react-router-dom';
import { encodeProposalTypeAndId } from '../../../logic/proposals/encoding';
import VoteSlider from '../vote-slider/vote-slider';
import Timer, { DATE_FORMAT } from '../../../components/timer/timer';
import Tooltip from '../../../components/tooltip/tooltip';
import { voteSliderSelector } from '../../../logic/proposals/selectors';
import Tag from '../../../components/tag/tag';
import globalStyles from '../../../styles/global-styles.module.scss';
import styles from './proposal-list.module.scss';
import classNames from 'classnames';
import ProposalStatus from './proposal-status/proposal-status';
import { format } from 'date-fns';

interface Props {
  // Proposals should be sorted by priority (the topmost proposal in the list has index 0)
  proposals: Proposal[];
}

interface ProposalProps {
  proposal: Proposal;
  device: 'mobile' | 'desktop';
}

const voteIdFormat = (voteId: BigNumber) => {
  return voteId.toString();
};

const ProposalInfoState = ({ proposal, device }: ProposalProps) => {
  const tooltipContent =
    proposal.type === 'primary'
      ? 'Primary proposals require an absolute majority to execute.'
      : 'Secondary proposals need 15% to execute.';

  return (
    <div
      className={classNames(styles.proposalItemBox, {
        [styles.desktop]: device === 'desktop',
        [styles.mobile]: device === 'mobile',
      })}
    >
      <p className={styles.proposalItemVoteId}>#{voteIdFormat(proposal.voteId)}</p>
      <ProposalStatus proposal={proposal} />
      <div className={styles.proposalItemTag}>
        <Tooltip content={tooltipContent}>
          <Tag type={proposal.type}>
            <span className={globalStyles.capitalize}>{proposal.type}</span>
          </Tag>
        </Tooltip>
      </div>
    </div>
  );
};

const ProposalList = (props: Props) => {
  const { proposals } = props;

  return (
    <>
      {proposals.map((p) => {
        const votingSliderData = voteSliderSelector(p);
        const navlink = {
          base: p.open ? 'proposals' : 'history',
          typeAndId: encodeProposalTypeAndId(p.type, voteIdFormat(p.voteId)),
        };

        return (
          <div className={styles.proposalItem} key={`${p.type}-${voteIdFormat(p.voteId)}`}>
            <div className={styles.proposalItemWrapper}>
              <ProposalInfoState proposal={p} device="mobile" />
              <p className={styles.proposalItemTitle}>
                <NavLink to={`/${navlink.base}/${navlink.typeAndId}`}>{p.metadata.title}</NavLink>
              </p>
              <div className={styles.proposalItemSubtitle}>
                <ProposalInfoState proposal={p} device="desktop" />
                <div className={styles.proposalItemBox}>
                  {/* TODO: Probably show deadline instead of startDate, see: https://api3workspace.slack.com/archives/C020RCCC3EJ/p1622639292015100?thread_ts=1622620763.004400&cid=C020RCCC3EJ */}
                  {p.open ? <Timer deadline={p.deadline} /> : format(p.startDate, DATE_FORMAT)}
                </div>
              </div>
            </div>

            <div className={styles.proposalVoteBar}>
              <VoteSlider {...votingSliderData} />
              <span className={styles.proposalVoteArrow}>
                <NavLink to={`/${navlink.base}/${navlink.typeAndId}`}>
                  <img src="/arrow-right.svg" alt="right arrow" />
                </NavLink>
              </span>
            </div>
          </div>
        );
      })}
    </>
  );
};

export default ProposalList;
