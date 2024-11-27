import classNames from 'classnames';
import { ProposalStatus } from '../../../logic/proposals/selectors';
import { images } from '../../../utils';
import styles from './vote-slider.module.scss';
import { VOTER_STATES } from '../../../chain-data';
import VoteStatus from '../vote-status';

interface IconProp {
  fill?: boolean;
}

export const NegativeVoteIcon = ({ fill }: IconProp) => (
  <img className={styles.voteIcon} src={fill ? images.errorCircleFill : images.errorCircle} alt="rejected icon" />
);

// TODO: Update the icon after the "check circle fill" is added as a react component
export const PositiveVoteIcon = ({ fill }: IconProp) => (
  <img className={styles.voteIcon} src={fill ? images.checkCircleFill : images.checkCircle} alt="passed icon" />
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
  const proposalApproved = !open && (proposalStatus === 'Execute' || proposalStatus === 'Executed');
  const proposalRejected = !open && proposalStatus === 'Rejected';

  return (
    <>
      {isLarge && (
        <div className={classNames(styles.barNames, { [styles.large]: isLarge })}>
          <div>
            <PositiveVoteIcon fill={proposalApproved} />
            For
          </div>
          <div>
            Against
            <NegativeVoteIcon fill={proposalRejected} />
          </div>
        </div>
      )}
      <div className={classNames(styles.voteSlider, { [styles.large]: isLarge })}>
        {!isLarge && <PositiveVoteIcon fill={proposalApproved} />}
        <div className={styles.barWrapper}>
          <div className={styles.bar}>
            <div className={styles.acceptanceQuorum} style={{ left: `${minAcceptanceQuorum}%` }}></div>
            <div
              className={classNames(styles.for, { [styles.grayOut]: proposalRejected })}
              style={{ width: formatPercentage(forPercentage) }}
            ></div>
            <div
              className={classNames(styles.against, { [styles.grayOut]: proposalApproved })}
              style={{ width: formatPercentage(againstPercentage) }}
            ></div>
          </div>
          <div className={styles.voteInfo}>
            <span className={classNames({ [styles.lost]: proposalRejected })}>{formatPercentage(forPercentage)}</span>
            {!isLarge && <VoteStatus voterState={voterState} wasDelegated={wasDelegated} />}
            <span className={classNames({ [styles.lost]: proposalApproved })}>
              {formatPercentage(againstPercentage)}
            </span>
          </div>
        </div>
        {!isLarge && <NegativeVoteIcon fill={proposalRejected} />}
      </div>
    </>
  );
};

export default VoteSlider;
