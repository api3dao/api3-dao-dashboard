import { BigNumber } from 'ethers';
import { formatApi3 } from '../../../utils/api3-format';
import RadialChart from './radial-chart';
import globalStyles from '../../../styles/global-styles.module.scss';
import styles from './staking-pool.module.scss';
import classNames from 'classnames';

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
    <div className={styles.stakingPool}>
      <div className={classNames(styles.stakingTable, styles.twoCells)}>
        <div className={styles.stakingTableRow}>
          <div className={classNames(styles.stakingTableCell, styles.rightAlign)}>
            <h3>{currentApy}%</h3>
          </div>
          <div className={styles.stakingTableCell}>
            <p className={globalStyles.secondaryColor}>Annual rewards (APY)</p>
          </div>
        </div>
        <div className={styles.stakingTableRow}>
          <div className={classNames(styles.stakingTableCell, styles.rightAlign)}>
            <h5>{annualInflationRate}%</h5>
          </div>
          <div className={styles.stakingTableCell}>
            <p className={globalStyles.secondaryColor}>Annual Inflation Rate</p>
          </div>
        </div>
      </div>
      <div className={styles.stakingTable}>
        <div className={styles.stakingTableRow}>
          <div className={classNames(styles.stakingTableCell, styles.oneCell, styles.rightAlign)}>
            <p className={styles.stakingTableCellTitle}>total staked</p>
            <p className={globalStyles.medium}>{totalStaked}</p>
          </div>
        </div>
        <div className={styles.stakingTableRow}>
          <div className={classNames(styles.stakingTableCell, styles.oneCell, styles.rightAlign)}>
            <p className={styles.stakingTableCellTitle}>staking target</p>
            <p className={globalStyles.medium}>{stakeTarget}</p>
          </div>
        </div>
      </div>
      <RadialChart completionPercent={stakedPercentage} />
    </div>
  );
};

export default StakingPool;
