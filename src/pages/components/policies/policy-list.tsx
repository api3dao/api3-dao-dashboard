import { Link } from 'react-router-dom';
import { format } from 'date-fns';
import Skeleton from '../../../components/skeleton';
import { BasePolicy } from '../../../chain-data';
import { isActive, useRemainingCoverageLoader } from '../../../logic/policies';
import { useStableIds, formatUsd, images } from '../../../utils';
import globalStyles from '../../../styles/global-styles.module.scss';
import styles from './policy-list.module.scss';

interface Props {
  policies: BasePolicy[];
}

export default function PolicyList(props: Props) {
  const policyIds = useStableIds(props.policies, (p) => p.policyId);
  useRemainingCoverageLoader(policyIds);

  return (
    <ul className={styles.policyList}>
      {props.policies.map((policy) => {
        const activeStatus = isActive(policy) ? (
          <span className={styles.active}>Active</span>
        ) : (
          <span className={styles.inactive}>Inactive</span>
        );

        return (
          <li key={policy.policyId} className={styles.policyItem} data-testid="policy-list-item">
            <div className={styles.policyItemMain}>
              <div className={styles.mobileActiveStatus}>{activeStatus}</div>
              <Link className={styles.policyItemTitle} to={`/policies/${policy.policyId}`}>
                {policy.metadata}
              </Link>

              <div className={styles.policyItemInfo}>
                <span className={styles.desktopActiveStatus}>{activeStatus}</span>
                <div className={styles.infoEntry}>
                  <span className={globalStyles.tertiaryColor}>Claims Allowed Until: </span>
                  <span className="visual-test:invisible">
                    {format(policy.claimsAllowedUntil, 'dd MMM yyyy')}
                    <span className={globalStyles.tertiaryColor}> {format(policy.claimsAllowedUntil, 'HH:mm')}</span>
                  </span>
                </div>
                <div className={styles.infoEntry}>
                  {policy.remainingCoverageInUsd ? (
                    <span>
                      {formatUsd(policy.remainingCoverageInUsd)} USD{' '}
                      <span className={globalStyles.tertiaryColor}>remaining</span>
                    </span>
                  ) : (
                    <Skeleton width="12ch">
                      <span className="sr-only">Loading remaining coverage...</span>
                    </Skeleton>
                  )}
                </div>
              </div>
            </div>

            <div className={styles.policyItemAction}>
              <Link tabIndex={-1} to={`/policies/${policy.policyId}`}>
                <img src={images.arrowRight} alt="right arrow" />
              </Link>
            </div>
          </li>
        );
      })}
    </ul>
  );
}
