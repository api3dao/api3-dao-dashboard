import { BigNumber } from 'ethers';
import { formatApi3 } from '../../../utils/api3-format';
import RadialChart from './radial-chart';
import globalStyles from '../../../styles/global-styles.module.scss';
import styles from './staking-pool.module.scss';
import classNames from 'classnames';

type Props = {
  data?: {
    annualApy: number;
    annualInflationRate: number;
    totalStaked: BigNumber;
    stakeTarget: BigNumber;
    totalStakedPercentage: number;
  };
};

const StakingPool = ({ data }: Props) => {
  const annualApy = parseFloat(data?.annualApy.toString() || '0').toFixed(1);
  const annualInflationRate = parseFloat(data ? data.annualInflationRate.toString() : '0').toFixed(2);
  const totalStaked = parseFloat(data ? formatApi3(data.totalStaked) : '0').toLocaleString();
  const stakeTarget = parseFloat(data ? formatApi3(data.stakeTarget) : '0').toLocaleString();
  const totalStakedPercentage = parseFloat((data?.totalStakedPercentage || 0).toFixed(2));

  return (
    <div className={styles.stakingPool}>
      <div className={classNames(styles.stakingTable, styles.twoCells)}>
        <div className={styles.stakingTableRow}>
          <div className={classNames(styles.stakingTableCell, styles.rightAlign)}>
            <p className={styles.stakingAnnualApy}>{annualApy}%</p>
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
      <div className={styles.stakingTableWrap}>
        <div className={classNames(styles.stakingTable, styles.oneCell)}>
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
        <div className={styles.stakingRadialChart}>
          <RadialChart completionPercent={totalStakedPercentage} />
        </div>
      </div>
    </div>
  );
};

export default StakingPool;
