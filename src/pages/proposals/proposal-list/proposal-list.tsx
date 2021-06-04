import { useMemo } from 'react';
import { BigNumber } from 'ethers';
import { useChainData } from '../../../chain-data';
import { NavLink } from 'react-router-dom';
import { encodeProposalTypeAndId } from '../../../logic/proposals/encoding';
import VoteSlider from '../../../components/vote-slider/vote-slider';
import Timer from '../../../components/timer/timer';
import Tooltip from '../../../components/tooltip/tooltip';
import { voteSliderSelector } from '../../../logic/proposals/selectors';
import Tag from '../../../components/tag/tag';
import globalStyles from '../../../styles/global-styles.module.scss';
import styles from './proposal-list.module.scss';
import classNames from 'classnames';

const VOTER_STATES = { 0: 'Unvoted', 1: 'Voted For', 2: 'Voted Against' };

const voteIdFormat = (voteId: BigNumber) => {
  return voteId.toString();
};

const ProposalList = () => {
  const { proposals } = useChainData();

  const allProposals = useMemo(() => {
    const primaryProposals = Object.values(proposals?.primary || {});
    const secondaryProposals = Object.values(proposals?.secondary || {});

    return [...primaryProposals, ...secondaryProposals].sort((p1, p2) =>
      p1.startDateRaw.lt(p2.startDateRaw) ? -1 : 1
    );
  }, [proposals?.primary, proposals?.secondary]);

  return (
    <>
      {allProposals.map((p) => {
        const votingSliderData = voteSliderSelector(p);
        const tooltipContent =
          p.type === 'primary'
            ? 'Primary proposals require an absolute majority to execute.'
            : 'Secondary proposals need 15% to execute.';

        return (
          <div className={styles.proposalItem} key={`${p.type}-${voteIdFormat(p.voteId)}`}>
            <div className={styles.proposalItemWrapper}>
              <p className={styles.proposalTitle}>{p.metadata.description}</p>
              <div className={styles.proposalItemSubtitle}>
                <div className={classNames(styles.proposalItemBox, styles.mr)}>
                  <p className={styles.proposalItemVoteId}>#{voteIdFormat(p.voteId)}</p>
                  <p className={styles.proposalItemVoterStates}>{VOTER_STATES[p.voterState]}</p>
                </div>
                <div className={classNames(styles.proposalItemBox, styles.date)}>
                  <Timer start={p.startDate} deadline={p.deadline} />
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
              <NavLink to={`/proposals/${encodeProposalTypeAndId(p.type, voteIdFormat(p.voteId))}`}>
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
