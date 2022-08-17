import { Link } from 'react-router-dom';
import Timer, { DATE_FORMAT } from '../../components/timer';
import { format, isAfter } from 'date-fns';
import { images, useForceUpdate } from '../../utils';
import { Claim } from '../../chain-data';
import { getCurrentDeadline } from '../../logic/claims';
import styles from './claim-list.module.scss';

interface Props {
  claims: Claim[];
}

export default function ClaimList(props: Props) {
  // We need to trigger a re-render the moment we go past a deadline
  const forceUpdate = useForceUpdate();

  return (
    <ul className={styles.claimList}>
      {props.claims.map((claim) => {
        const deadline = getCurrentDeadline(claim);
        return (
          <li key={claim.claimId} className={styles.claimItem}>
            <div className={styles.claimItemMain}>
              <Link className={styles.claimItemTitle} to={`/claims/${claim.claimId}`}>
                Claim {claim.claimId}
              </Link>

              <div className={styles.claimItemInfo}>
                {deadline ? (
                  <Timer deadline={deadline} onDeadlineExceeded={forceUpdate} />
                ) : (
                  <span>{format(claim.timestamp, DATE_FORMAT)}</span>
                )}
                <Link to={{ pathname: `/policies/${claim.policyId}`, search: 'from=claims' }}>Policy</Link>
              </div>
            </div>

            <div className={styles.claimItemStatus}>
              <ClaimStatus claim={claim} />
              <Link tabIndex={-1} to={`/claims/${claim.claimId}`}>
                <img src={images.arrowRight} alt="right arrow" />
              </Link>
            </div>
          </li>
        );
      })}
    </ul>
  );
}

interface ClaimStatusProps {
  claim: Claim;
}

function ClaimStatus(props: ClaimStatusProps) {
  const { claim } = props;
  const { dispute } = claim;

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
      if (dispute && dispute.status !== 'Waiting') {
        switch (dispute.ruling) {
          case 'PayClaim':
            return <>Approved</>;
          case 'PaySettlement':
            return <>Approved Counter</>;
          case 'DoNotPay':
            return <>Rejected</>;
        }
      }
      return <>Kleros Processing</>;
    case 'SettlementAccepted':
      return <>Accepted Counter</>;
    case 'DisputeResolvedWithSettlementPayout':
      return <>Approved Counter</>;
    case 'DisputeResolvedWithoutPayout':
      return <>Rejected</>;
    case 'None':
      return null;
  }
}
