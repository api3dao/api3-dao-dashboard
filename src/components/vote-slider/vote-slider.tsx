import classNames from 'classnames';
import './vote-slider.scss';

const NegativeVoteIcon = () => {
  return (
    <svg width="16" height="20" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path
        d="M16 1.61143L14.3886 0L8 6.38857L1.61143 0L0 1.61143L6.38857 8L0 14.3886L1.61143 16L8 9.61143L14.3886 16L16 14.3886L9.61143 8L16 1.61143Z"
        fill="#D233F2"
      />
    </svg>
  );
};

const PositiveVoteIcon = () => {
  return (
    <svg width="20" height="20" viewBox="0 0 22 17" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path
        d="M6.9875 13.225L1.775 8.0125L0 9.775L6.9875 16.7625L21.9875 1.7625L20.225 0L6.9875 13.225Z"
        fill="#7CE3CB"
      />
    </svg>
  );
};

const formatPercentage = (percentage: number) => `${percentage}%`;

interface Props {
  minAcceptanceQuorum: number;
  status: string;
  forPercentage: number;
  againstPercentage: number;
}

const VoteSlider = (props: Props) => {
  const { minAcceptanceQuorum, status, forPercentage, againstPercentage } = props;

  return (
    <div className="vote-slider">
      <PositiveVoteIcon />
      <div className="bar-wrapper">
        <div className="bar">
          <div className="acceptance-quorum" style={{ left: `${minAcceptanceQuorum}%` }}></div>
          <div className="for" style={{ width: formatPercentage(forPercentage) }}></div>
          <div className="against" style={{ width: formatPercentage(againstPercentage) }}></div>
        </div>
        <div className="vote-info">
          <span>{formatPercentage(forPercentage)}</span>
          <span className={classNames('status', status)}>{status}</span>
          <span>{formatPercentage(againstPercentage)}</span>
        </div>
      </div>
      <NegativeVoteIcon />
    </div>
  );
};

export default VoteSlider;
