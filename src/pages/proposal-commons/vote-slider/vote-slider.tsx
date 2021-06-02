import classNames from 'classnames';
import { ProposalStatus } from '../../../logic/proposals/selectors';
import globalStyles from '../../styles/global-styles.module.scss';
import styles from './vote-slider.module.scss';

interface IconProp {
  large?: boolean;
}

const VOTER_STATES = { 0: 'Unvoted', 1: 'Voted For', 2: 'Voted Against' } as const;

const NegativeVoteIcon = ({ large }: IconProp) => (
  <img className={classNames(styles.voteIcon, { [styles.large]: large })} src="/close-pink.svg" alt="rejected icon" />
);

const PositiveVoteIcon = ({ large }: IconProp) => (
  <img className={classNames(styles.voteIcon, { [styles.large]: large })} src="/check-green.svg" alt="passed icon" />
);

const formatPercentage = (percentage: number) => `${percentage}%`;

interface Props {
  minAcceptanceQuorum: number;
  voterState: keyof typeof VOTER_STATES;
  forPercentage: number;
  againstPercentage: number;
  open: boolean;
  proposalStatus: ProposalStatus;
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
              className={classNames(styles.for, { grayOut: !open && proposalStatus === 'Rejected' })}
              style={{ width: formatPercentage(forPercentage) }}
            ></div>
            <div
              className={classNames(styles.against, {
                grayOut: !open && (proposalStatus === 'Execute' || proposalStatus === 'Executed'),
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
            {!isLarge && (
              <span
                className={classNames(styles.voterState, {
                  [styles.against]: VOTER_STATES[voterState] === 'Voted Against',
                  [styles.for]: VOTER_STATES[voterState] === 'Voted For',
                })}
              >
                {VOTER_STATES[voterState]}
              </span>
            )}
            <span className={globalStyles.secondaryColor}>{formatPercentage(againstPercentage)}</span>
          </div>
        </div>
        <NegativeVoteIcon large={isLarge} />
      </div>
    </>
  );
};

export default VoteSlider;
