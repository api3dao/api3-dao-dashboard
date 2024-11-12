import { useChainData } from '../../../chain-data';
import { formatAndRoundApi3, round } from '../../../utils/api3-format';
import { stakingPoolSelector } from '../../../logic/dashboard';
import RadialChart from './radial-chart';
import globalStyles from '../../../styles/global-styles.module.scss';
import styles from './staking-pool.module.scss';
import classNames from 'classnames';
import { images, UNKNOWN_NUMBER } from '../../../utils';
import { Tooltip } from '../../../components/tooltip';

const StakingPool = () => {
  const { dashboardState: data } = useChainData();
  const stakingPool = stakingPoolSelector(data);

  const currentApy = stakingPool ? round(stakingPool.currentApy, 1) : UNKNOWN_NUMBER;
  const annualTotalSupplyGrowth = stakingPool ? round(stakingPool.annualTotalSupplyGrowth) : UNKNOWN_NUMBER;
  const stakedPercentage = stakingPool ? Number.parseFloat(round(stakingPool.stakedPercentage)) : undefined;
  const totalStaked = data ? formatAndRoundApi3(data.totalStake) : UNKNOWN_NUMBER;
  const stakingTargetInTokens = stakingPool ? formatAndRoundApi3(stakingPool.stakingTargetInTokens) : UNKNOWN_NUMBER;

  const currentApyText = currentApy === UNKNOWN_NUMBER ? currentApy : `${currentApy}%`;
  const annualTotalSupplyGrowthText =
    annualTotalSupplyGrowth === UNKNOWN_NUMBER ? annualTotalSupplyGrowth : `${annualTotalSupplyGrowth}%`;
  const estimatedValueTooltip = 'Value is based on the current APR and may change over time';

  return (
    <div className={styles.stakingPool}>
      <div className={styles.firstSection}>
        <div className={styles.sectionRow}>
          <div className={classNames(styles.firstSectionCell, globalStyles.textRight)}>
            <p className={styles.firstSectionValue}>{currentApyText}</p>
          </div>
          <div className={styles.firstSectionCell}>
            <p className={styles.firstSectionLabel}>Annual Rewards (APY)</p>
            <Tooltip overlay={estimatedValueTooltip}>
              <img src={images.helpOutline} alt="help" />
            </Tooltip>
          </div>
        </div>
        <div className={styles.sectionRow}>
          <div className={classNames(styles.firstSectionCell, globalStyles.textRight)}>
            <h5 className={classNames(styles.firstSectionValue, styles.firstSectionValueSupplyGrowth)}>
              {annualTotalSupplyGrowthText}
            </h5>
          </div>
          <div className={styles.firstSectionCell}>
            <p className={styles.firstSectionLabel}>Annual Total Supply Growth</p>
            <Tooltip overlay={estimatedValueTooltip}>
              <img src={images.helpOutline} alt="help" />
            </Tooltip>
          </div>
        </div>
      </div>

      <div className={classNames(styles.reverseDirectionWrap)}>
        <div className={styles.secondSection}>
          <div className={classNames(styles.sectionRow, styles.secondSectionRow)}>
            <div className={styles.secondSectionCell}>
              <p className={styles.secondSectionLabel}>total staked</p>
              <p className={styles.secondSectionValue}>{totalStaked}</p>
            </div>
          </div>
          <div className={classNames(styles.sectionRow, styles.secondSectionRow)}>
            <div className={classNames(styles.secondSectionCell, styles.secondSectionCellTarget)}>
              <p className={styles.secondSectionLabel}>staking target</p>
              <p className={styles.secondSectionValue}>{stakingTargetInTokens}</p>
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
