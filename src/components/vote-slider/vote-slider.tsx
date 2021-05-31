import classNames from 'classnames';
import './vote-slider.scss';

interface IconProp {
  large: boolean;
}

const NegativeVoteIcon = ({ large }: IconProp) => (
  <img className={classNames('vote-icon', { [`_large`]: large })} src="/close-pink.svg" alt="rejected icon" />
);

const PositiveVoteIcon = ({ large }: IconProp) => (
  <img className={classNames('vote-icon', { [`_large`]: large })} src="/check-green.svg" alt="passed icon" />
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
        <div className="bar-names">
          <p className="bold">For</p>
          <p className="bold">Against</p>
        </div>
      )}
      <div className="vote-slider">
        <PositiveVoteIcon large={size === 'large'} />
        <div className="bar-wrapper">
          <div className="bar">
            <div className="acceptance-quorum" style={{ left: `${minAcceptanceQuorum}%` }}></div>
            <div className="for" style={{ width: formatPercentage(forPercentage) }}></div>
            <div className="against" style={{ width: formatPercentage(againstPercentage) }}></div>
          </div>
          <div
            className={classNames('vote-info medium', {
              [`text-xsmall`]: size === 'normal',
              [`text-normal`]: size === 'large',
            })}
          >
            <span className="secondary-color">{formatPercentage(forPercentage)}</span>
            {size !== 'large' && <span className={classNames('status', status)}>{status}</span>}
            <span className="secondary-color">{formatPercentage(againstPercentage)}</span>
          </div>
        </div>
        <NegativeVoteIcon large={size === 'large'} />
      </div>
    </>
  );
};

export default VoteSlider;
