import { useChainData } from '../../../chain-data';
import { formatAndRoundApi3, round } from '../../../utils/api3-format';
import { stakingPoolSelector } from '../../../logic/dashboard';
import RadialChart from './radial-chart';
import styles from './staking-pool.module.scss';
import classNames from 'classnames';
import { UNKNOWN_NUMBER } from '../../../utils';

const StakingPool = () => {
  const { dashboardState: data } = useChainData();
  const stakingPool = stakingPoolSelector(data);

  const supplyStakedPercentage = stakingPool ? Number.parseFloat(round(stakingPool.supplyStakedPercentage)) : undefined;
  const totalStaked = data ? formatAndRoundApi3(data.totalStake) : UNKNOWN_NUMBER;
  const totalSupply = data ? formatAndRoundApi3(data.api3Supply) : UNKNOWN_NUMBER;

  return (
    <div className={styles.stakingPool}>
      <div className={styles.firstSection}>
        <div className={styles.sectionRow}>
          <div className={classNames(styles.firstSectionCell, styles.leftColumn)}>
            <p className={styles.firstSectionValue}>0%</p>
          </div>
          <div className={classNames(styles.firstSectionCell, styles.rightColumn)}>
            <p className={styles.firstSectionLabel}>Annual Rewards (APY)</p>
            <span className={styles.endedPill}>Ended</span>
          </div>
        </div>
        <div className={styles.sectionRow}>
          <div className={classNames(styles.firstSectionCell, styles.leftColumn)}>
            <h5 className={classNames(styles.firstSectionValue, styles.firstSectionValueSupplyGrowth)}>0%</h5>
          </div>
          <div className={classNames(styles.firstSectionCell, styles.rightColumn)}>
            <p className={styles.firstSectionLabel}>Annual Total Supply Growth</p>
            <span className={styles.endedPill}>Ended</span>
          </div>
        </div>
      </div>

      <div className={classNames(styles.reverseDirectionWrap)}>
        <div className={styles.secondSection}>
          <div className={classNames(styles.sectionRow, styles.secondSectionRow)}>
            <div className={styles.secondSectionCell}>
              <p className={styles.secondSectionLabel}>Total Staked</p>
              <p className={styles.secondSectionValue}>{totalStaked}</p>
            </div>
          </div>
          <div className={classNames(styles.sectionRow, styles.secondSectionRow)}>
            <div className={classNames(styles.secondSectionCell, styles.secondSectionCellTarget)}>
              <p className={styles.secondSectionLabel}>Total Supply</p>
              <p className={styles.secondSectionValue}>{totalSupply}</p>
            </div>
          </div>
        </div>

        <div className={styles.stakingRadialChart}>
          <RadialChart completionPercent={supplyStakedPercentage} />
        </div>
      </div>
    </div>
  );
};

export default StakingPool;
