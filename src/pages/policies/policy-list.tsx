import { Policy } from '../../chain-data';
import { Link } from 'react-router-dom';
import { DATE_FORMAT } from '../../components/timer';
import { format } from 'date-fns';
import { images } from '../../utils';
import { isActive } from '../../logic/policies';
import { commify } from 'ethers/lib/utils';
import globalStyles from '../../styles/global-styles.module.scss';
import styles from './policy-list.module.scss';

interface Props {
  policies: Policy[];
}

export default function PolicyList(props: Props) {
  return (
    <ul className={styles.policyList}>
      {props.policies.map((policy) => (
        <li key={policy.policyId} className={styles.policyItem}>
          <div className={styles.policyItemMain}>
            <Link className={styles.policyItemTitle} to={`/policies/${policy.policyId}`}>
              Policy {policy.ipfsHash}
            </Link>

            <div className={styles.policyItemInfo}>
              {isActive(policy) ? <span>Active</span> : <span className={globalStyles.tertiaryColor}>Inactive</span>}
              <span>
                <span className={globalStyles.tertiaryColor}>Ends:</span> {format(policy.endTime, DATE_FORMAT)}{' '}
                <span className={globalStyles.tertiaryColor}>{format(policy.endTime, 'HH:mm')}</span>
              </span>
              <span>
                <span className={globalStyles.tertiaryColor}>Coverage:</span> $
                {commify(policy.coverageAmount.toString())}
              </span>
            </div>
          </div>

          <div className={styles.policyItemArrow}>
            <Link tabIndex={-1} to={`/policies/${policy.policyId}`}>
              <img src={images.arrowRight} alt="right arrow" />
            </Link>
          </div>
        </li>
      ))}
    </ul>
  );
}
