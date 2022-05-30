import { Link } from 'react-router-dom';
import Timer, { DATE_FORMAT } from '../../components/timer';
import { format, isAfter } from 'date-fns';
import { images } from '../../utils';
import { Claim } from '../../chain-data';
import styles from './claim-list.module.scss';

interface Props {
  claims: Claim[];
}

export default function ClaimList(props: Props) {
  return (
    <ul className={styles.claimList}>
      {props.claims.map((claim) => (
        <li key={claim.claimId} className={styles.claimItem}>
          <div className={styles.claimItemMain}>
            <Link className={styles.claimItemTitle} to={`/claims/${claim.claimId}`}>
              Claim {claim.claimId}
            </Link>

            <div className={styles.claimItemInfo}>
              {claim.deadline ? (
                <Timer deadline={claim.deadline} />
              ) : (
                <span>{format(claim.timestamp, DATE_FORMAT)}</span>
              )}
              <Link to={`/policies/${claim.policyId}`}>Policy</Link>
            </div>
          </div>

          <div className={styles.claimItemStatus}>
            <ClaimStatus claim={claim} />
            <Link tabIndex={-1} to={`/claims/${claim.claimId}`}>
              <img src={images.arrowRight} alt="right arrow" />
            </Link>
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
    case 'ClaimCreated':
      if (isAfter(new Date(), claim.deadline!)) {
        return <>Rejected</>;
      }
      return <>API3 Processing</>;
    case 'SettlementProposed':
      return <>Countered</>;
    case 'ClaimAccepted':
    case 'DisputeResolvedWithClaimPayout':
      return <>Approved</>;
    case 'DisputeCreated':
      return <>Kleros Processing</>;
    case 'SettlementAccepted':
      return <>Accepted Counter</>;
    case 'DisputeResolvedWithSettlementPayout':
      return <>Approved Counter</>;
    case 'DisputeResolvedWithoutPayout':
      return <>Rejected</>;
    case 'TimedOut':
      return <>Timed Out</>;
    case 'None':
      return null;
  }
}
