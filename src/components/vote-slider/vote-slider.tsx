import classNames from 'classnames';
import globalStyles from '../../styles/global-styles.module.scss';
import styles from './vote-slider.module.scss';

interface IconProp {
  large: boolean;
}

const NegativeVoteIcon = ({ large }: IconProp) => (
  <img className={classNames(styles.voteIcon, { [styles.large]: large })} src="/close-pink.svg" alt="rejected icon" />
);

const PositiveVoteIcon = ({ large }: IconProp) => (
  <img className={classNames(styles.voteIcon, { [styles.large]: large })} src="/check-green.svg" alt="passed icon" />
);

const formatPercentage = (percentage: number) => `${percentage}%`;

interface Props {
  minAcceptanceQuorum: number;
  status: string;
  forPercentage: number;
  againstPercentage: number;
  size?: 'normal' | 'large';
}

const VoteSlider = (props: Props) => {
  const { minAcceptanceQuorum, status, forPercentage, againstPercentage, size = 'normal' } = props;

  return (
    <>
      {size === 'large' && (
        <div className={styles.barNames}>
          <p className={globalStyles.bold}>For</p>
          <p className={globalStyles.bold}>Against</p>
        </div>
      )}
      <div className={styles.voteSlider}>
        <PositiveVoteIcon large={size === 'large'} />
        <div className={styles.barWrapper}>
          <div className={styles.bar}>
            <div className={styles.acceptanceQuorum} style={{ left: `${minAcceptanceQuorum}%` }}></div>
            <div className={styles.for} style={{ width: formatPercentage(forPercentage) }}></div>
            <div className={styles.against} style={{ width: formatPercentage(againstPercentage) }}></div>
          </div>
          <div
            className={classNames(styles.voteInfo, {
              [globalStyles.textXSmall]: size === 'normal',
              [globalStyles.textNormal]: size === 'large',
            })}
          >
            <span className={globalStyles.secondaryColor}>{formatPercentage(forPercentage)}</span>
            {size !== 'large' && (
              <span
                className={classNames(styles.status, {
                  [styles.failing]: status === 'failing',
                  [styles.passing]: status === 'passing',
                })}
              >
                {status}
              </span>
            )}
            <span className={globalStyles.secondaryColor}>{formatPercentage(againstPercentage)}</span>
          </div>
        </div>
        <NegativeVoteIcon large={size === 'large'} />
      </div>
    </>
  );
};

export default VoteSlider;
