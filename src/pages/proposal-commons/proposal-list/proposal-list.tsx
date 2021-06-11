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

const voteIdFormat = (voteId: BigNumber) => {
  return voteId.toString();
};

interface Props {
  // Proposals should be sorted by priority (the topmost proposal in the list has index 0)
  proposals: Proposal[];
}

const ProposalList = (props: Props) => {
  const { proposals } = props;

  return (
    <>
      {proposals.map((p) => {
        const votingSliderData = voteSliderSelector(p);
        const tooltipContent =
          p.type === 'primary'
            ? 'Primary proposals require an absolute majority to execute.'
            : 'Secondary proposals need 15% to execute.';
        const navlink = {
          base: p.open ? 'proposals' : 'history',
          typeAndId: encodeProposalTypeAndId(p.type, voteIdFormat(p.voteId)),
        };

        return (
          <div className={styles.proposalItem} key={`${p.type}-${voteIdFormat(p.voteId)}`}>
            <div className={styles.proposalItemWrapper}>
              <p className={styles.proposalItemTitle}>{p.metadata.title}</p>
              <div className={styles.proposalItemSubtitle}>
                <div className={classNames(styles.proposalItemBox, styles.mr)}>
                  <p className={styles.proposalItemVoteId}>#{voteIdFormat(p.voteId)}</p>
                  <ProposalStatus proposal={p} />
                </div>
                <div className={classNames(styles.proposalItemBox, styles.date)}>
                  {/* TODO: Probably show deadline instead of startDate, see: https://api3workspace.slack.com/archives/C020RCCC3EJ/p1622639292015100?thread_ts=1622620763.004400&cid=C020RCCC3EJ */}
                  {p.open ? <Timer deadline={p.deadline} /> : format(p.startDate, DATE_FORMAT)}
                </div>
                <div className={styles.proposalItemBox}>
                  <Tooltip content={tooltipContent}>
                    <Tag type={p.type}>
                      <span className={globalStyles.capitalize}>{p.type}</span>
                    </Tag>
                  </Tooltip>
                </div>
              </div>
            </div>

            <div className={styles.proposalVoteBar}>
              <VoteSlider {...votingSliderData} />
              <NavLink to={`/${navlink.base}/${navlink.typeAndId}`}>
                <img src="/arrow-right.svg" alt="right arrow" />
              </NavLink>
            </div>
          </div>
        );
      })}
    </>
  );
};

export default ProposalList;
