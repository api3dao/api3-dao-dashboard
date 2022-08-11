import { Link } from 'react-router-dom';
import { format } from 'date-fns';
import { Policy } from '../../chain-data';
import { isActive, useRemainingCoverageLoader } from '../../logic/policies';
import { useStableIds, formatUsd, images } from '../../utils';
import globalStyles from '../../styles/global-styles.module.scss';
import styles from './policy-list.module.scss';

interface Props {
  policies: Policy[];
}

export default function PolicyList(props: Props) {
  const policyIds = useStableIds(props.policies, (p) => p.policyId);
  useRemainingCoverageLoader(policyIds);

  return (
    <ul className={styles.policyList}>
      {props.policies.map((policy) => (
        <li key={policy.policyId} className={styles.policyItem}>
          <div className={styles.policyItemMain}>
            <Link className={styles.policyItemTitle} to={`/policies/${policy.policyId}`}>
              {policy.metadata}
            </Link>

            <div className={styles.policyItemInfo}>
              {isActive(policy) ? <span>Active</span> : <span className={globalStyles.tertiaryColor}>Inactive</span>}
              <div className={styles.infoEntry}>
                <span className={globalStyles.tertiaryColor}>Ends: </span>
                <span>
                  {format(policy.claimsAllowedUntil, 'dd MMM yyyy')}
                  <span className={globalStyles.tertiaryColor}> {format(policy.claimsAllowedUntil, 'HH:mm')}</span>
                </span>
              </div>
              <div className={styles.infoEntry}>
                <span className={globalStyles.tertiaryColor}>Coverage: </span>
                <span>${formatUsd(policy.coverageAmountInUsd)}</span>
                {policy.remainingCoverageInUsd && (
                  <span className={globalStyles.tertiaryColor}>
                    (${formatUsd(policy.remainingCoverageInUsd)} remaining)
                  </span>
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
      ))}
    </ul>
  );
}
