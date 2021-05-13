import RadialChart from './radial-chart';
import './staking-pool.scss';

type Props = {
  data?: {
    annualApy: string;
    annualInflationRate: string;
    totalStaked: string;
    stakeTarget: string;
    totalStakedPercentage: string;
  };
};

const StakingPool = ({ data }: Props) => {
  const annualApy = parseFloat(data?.annualApy || '10').toFixed(1);
  const annualInflationRate = parseFloat(data?.annualInflationRate || '2');
  const totalStaked = parseFloat(data?.totalStaked || '8540000').toLocaleString();
  const stakeTarget = parseFloat(data?.stakeTarget || '10000000').toLocaleString();
  const totalStakedPercentage = parseFloat(data?.totalStakedPercentage || '85.4');

  return (
    <div className="staking-pool">
      <div className="staking-table _twoCells">
        <div className="staking-table-row">
          <div className="staking-table-cell _rightAlign">
            <h3>{annualApy}%</h3>
          </div>
          <div className="staking-table-cell">
            <p className="secondary-color">Annual rewards (APY)</p>
          </div>
        </div>
        <div className="staking-table-row">
          <div className="staking-table-cell _rightAlign">
            <h5>{annualInflationRate}%</h5>
          </div>
          <div className="staking-table-cell">
            <p className="secondary-color">Annual Inflation Rate</p>
          </div>
        </div>
      </div>
      <div className="staking-table">
        <div className="staking-table-row">
          <div className="staking-table-cell _rightAlign">
            <p className="text-xsmall secondary-color uppercase medium">total staked</p>
            <p className="medium">{totalStaked}</p>
          </div>
        </div>
        <div className="staking-table-row">
          <div className="staking-table-cell _rightAlign">
            <p className="text-xsmall secondary-color uppercase medium">staking target</p>
            <p className="medium">{stakeTarget}</p>
          </div>
        </div>
      </div>
      <RadialChart completionPercent={totalStakedPercentage} />
    </div>
  );
};

export default StakingPool;
