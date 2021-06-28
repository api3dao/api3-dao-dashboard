import classNames from 'classnames';
import { ProposalStatus } from '../../../logic/proposals/selectors';
import { images } from '../../../utils';
import globalStyles from '../../../styles/global-styles.module.scss';
import styles from './vote-slider.module.scss';
import { VOTER_STATES } from '../../../chain-data';
import VoteStatus from '../vote-status';

interface IconProp {
  large?: boolean;
}

export const NegativeVoteIcon = ({ large }: IconProp) => (
  <img className={classNames(styles.voteIcon, { [styles.large]: large })} src={images.closePink} alt="rejected icon" />
);

export const PositiveVoteIcon = ({ large }: IconProp) => (
  <img className={classNames(styles.voteIcon, { [styles.large]: large })} src={images.checkGreen} alt="passed icon" />
);

const formatPercentage = (percentage: number) => `${percentage.toFixed(2)}%`;

interface Props {
  minAcceptanceQuorum: number;
  voterState: keyof typeof VOTER_STATES;
  forPercentage: number;
  againstPercentage: number;
  open: boolean;
  proposalStatus: ProposalStatus;
  wasDelegated: boolean;
  size?: 'normal' | 'large';
}

const VoteSlider = (props: Props) => {
  const {
    minAcceptanceQuorum,
    voterState,
    forPercentage,
    againstPercentage,
    size = 'normal',
    open,
    wasDelegated,
    proposalStatus,
  } = props;

  const isLarge = size === 'large';

  return (
    <>
      {isLarge && (
        <div className={styles.barNames}>
          <p className={globalStyles.bold}>For</p>
          <p className={globalStyles.bold}>Against</p>
        </div>
      )}
      <div className={styles.voteSlider}>
        <PositiveVoteIcon large={isLarge} />
        <div className={styles.barWrapper}>
          <div className={styles.bar}>
            <div className={styles.acceptanceQuorum} style={{ left: `${minAcceptanceQuorum}%` }}></div>
            <div
              className={classNames(styles.for, { [styles.grayOut]: !open && proposalStatus === 'Rejected' })}
              style={{ width: formatPercentage(forPercentage) }}
            ></div>
            <div
              className={classNames(styles.against, {
                [styles.grayOut]: !open && (proposalStatus === 'Execute' || proposalStatus === 'Executed'),
              })}
              style={{ width: formatPercentage(againstPercentage) }}
            ></div>
          </div>
          <div
            className={classNames(styles.voteInfo, {
              [globalStyles.textXSmall]: !isLarge,
              [globalStyles.textNormal]: isLarge,
            })}
          >
            <span className={globalStyles.secondaryColor}>{formatPercentage(forPercentage)}</span>
            {!isLarge && <VoteStatus voterState={voterState} wasDelegated={wasDelegated} />}
            <span className={globalStyles.secondaryColor}>{formatPercentage(againstPercentage)}</span>
          </div>
        </div>
        <NegativeVoteIcon large={isLarge} />
      </div>
    </>
  );
};

export default VoteSlider;
