import { useChainData } from '../../../chain-data';
import { formatApi3 } from '../../../utils/api3-format';
import { stakingPoolSelector } from '../../../logic/dashboard';
import RadialChart from './radial-chart';
import globalStyles from '../../../styles/global-styles.module.scss';
import styles from './staking-pool.module.scss';
import classNames from 'classnames';

const StakingPool = () => {
  const { dashboardState: data } = useChainData();
  const stakingPool = stakingPoolSelector(data);

  const currentApy = parseFloat(stakingPool?.currentApy.toString() || '0').toFixed(1);
  const annualInflationRate = parseFloat(stakingPool ? stakingPool.annualInflationRate.toString() : '0').toFixed(2);
  const stakedPercentage = parseFloat((stakingPool?.stakedPercentage || 0).toFixed(2));

  const totalStaked = parseFloat(data ? formatApi3(data.totalStake) : '0').toLocaleString();
  const stakeTarget = parseFloat(stakingPool ? formatApi3(stakingPool.stakeTarget) : '0').toLocaleString();

  return (
    <div className={styles.stakingPool}>
      <div className={classNames(styles.stakingTable, styles.twoCells)}>
        <div className={styles.stakingTableRow}>
          <div className={classNames(styles.stakingTableCell, styles.rightAlign)}>
            <p className={styles.stakingAnnualApy}>{currentApy}%</p>
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
          <RadialChart completionPercent={stakedPercentage} />
        </div>
      </div>
    </div>
  );
};

export default StakingPool;
