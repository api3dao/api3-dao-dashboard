import { useChainData } from '../../../chain-data';
import { formatApi3 } from '../../../utils/api3-format';
import { stakingPoolSelector } from '../../../logic/dashboard';
import RadialChart from './radial-chart';
import globalStyles from '../../../styles/global-styles.module.scss';
import styles from './staking-pool.module.scss';
import classNames from 'classnames';
import { UNKNOWN_NUMBER } from '../../../utils';

const StakingPool = () => {
  const { dashboardState: data } = useChainData();
  const stakingPool = stakingPoolSelector(data);

  const currentApy = stakingPool ? parseFloat(stakingPool.currentApy.toString()).toFixed(1) : UNKNOWN_NUMBER;
  const annualInflationRate = stakingPool
    ? parseFloat(stakingPool.annualInflationRate.toString()).toFixed(2)
    : UNKNOWN_NUMBER;
  const stakedPercentage = stakingPool ? parseFloat(stakingPool.stakedPercentage.toFixed(2)) : UNKNOWN_NUMBER;
  const totalStaked = data ? parseFloat(formatApi3(data.totalStake)).toLocaleString() : UNKNOWN_NUMBER;
  const stakingTargetInTokens = stakingPool
    ? parseFloat(formatApi3(stakingPool.stakingTargetInTokens)).toFixed(2)
    : UNKNOWN_NUMBER;

  const currentApyText = currentApy === UNKNOWN_NUMBER ? currentApy : `${currentApy}%`;
  const annualInflationRateText =
    annualInflationRate === UNKNOWN_NUMBER ? annualInflationRate : `${annualInflationRate}%`;

  return (
    <div className={styles.stakingPool}>
      <div className={classNames(styles.stakingTable, styles.twoCells)}>
        <div className={styles.stakingTableRow}>
          <div className={classNames(styles.stakingTableCell, styles.rightAlign)}>
            <p className={styles.stakingAnnualApy}>{currentApyText}</p>
          </div>
          <div className={styles.stakingTableCell}>
            <p className={globalStyles.secondaryColor}>Annual rewards (APY)</p>
          </div>
        </div>
        <div className={styles.stakingTableRow}>
          <div className={classNames(styles.stakingTableCell, styles.rightAlign)}>
            <h5>{annualInflationRateText}</h5>
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
              <p className={globalStyles.medium}>{stakingTargetInTokens}</p>
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
