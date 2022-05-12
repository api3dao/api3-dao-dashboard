import { NavLink } from 'react-router-dom';
import Timer, { DATE_FORMAT } from '../../components/timer';
import { format } from 'date-fns';
import { images } from '../../utils';
import { Claim } from '../../chain-data';
import styles from './claim-list.module.scss';

interface ClaimListProps {
  claims: Claim[];
}

export default function ClaimList(props: ClaimListProps) {
  return (
    <ul className={styles.claimList}>
      {props.claims.map((claim) => (
        <li key={claim.claimId} className={styles.claimItem}>
          <div className={styles.claimItemMain}>
            <NavLink className={styles.claimItemTitle} to={`/claims/${claim.claimId}`}>
              Claim {claim.claimId}
            </NavLink>

            <div className={styles.claimItemInfo}>
              {claim.deadline ? (
                <Timer deadline={claim.deadline} />
              ) : (
                <span>{format(claim.timestamp, DATE_FORMAT)}</span>
              )}
              <NavLink to={`/policies/${claim.policyId}`}>Policy</NavLink>
            </div>
          </div>

          <div className={styles.claimItemStatus}>
            <ClaimStatus claim={claim} />
            <NavLink tabIndex={-1} to={`/claims/${claim.claimId}`}>
              <img src={images.arrowRight} alt="right arrow" />
            </NavLink>
          </div>
        </li>
      ))}
    </ul>
  );
}

interface ClaimStatusProps {
  claim: Claim;
}

function ClaimStatus(props: ClaimStatusProps) {
  const { claim } = props;
  switch (claim.status) {
    case 'Submitted':
    case 'Appealed':
      return <>Processing</>;
    case 'MediationOffered':
      return <>Countered</>;
    case 'Resolved':
      return claim.claimedAmount === claim.resolvedAmount ? (
        <>Approved</>
      ) : (
        // Kleros came back with an amount less than the claim, so present it as a counter offer
        <>Countered</>
      );
    case 'Accepted':
      return <>Accepted</>;
    case 'Rejected':
      return <>Rejected</>;
    default:
      return null;
  }
}
