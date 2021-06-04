import { BigNumber } from 'ethers';
import { formatApi3 } from '../../../utils/api3-format';
import RadialChart from './radial-chart';
import './staking-pool.scss';

type Props = {
  data?: {
    annualInflationRate: number;
    currentApy: number;
    totalStake: BigNumber;
    stakeTarget: BigNumber;
    stakedPercentage: number;
  };
};

const StakingPool = ({ data }: Props) => {
  const currentApy = parseFloat(data?.currentApy.toString() || '0').toFixed(1);
  const annualInflationRate = parseFloat(data ? data.annualInflationRate.toString() : '0').toFixed(2);
  const totalStaked = parseFloat(data ? formatApi3(data.totalStake) : '0').toLocaleString();
  const stakeTarget = parseFloat(data ? formatApi3(data.stakeTarget) : '0').toLocaleString();
  const stakedPercentage = parseFloat((data?.stakedPercentage || 0).toFixed(2));

  return (
    <div className="staking-pool">
      <div className="staking-table _twoCells">
        <div className="staking-table-row">
          <div className="staking-table-cell _rightAlign">
            <h3>{currentApy}%</h3>
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
      <RadialChart completionPercent={stakedPercentage} />
    </div>
  );
};

export default StakingPool;
