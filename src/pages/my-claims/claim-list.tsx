import { Link } from 'react-router-dom';
import Timer from '../../components/timer';
import Api3Icon from '../../components/icons/api3-icon';
import KlerosIcon from '../../components/icons/kleros-icon';
import { format, isAfter } from 'date-fns';
import { images, useForceUpdate } from '../../utils';
import { Claim } from '../../chain-data';
import { getCurrentDeadline, useClaimPayoutDataPreload } from '../../logic/claims';
import globalStyles from '../../styles/global-styles.module.scss';
import styles from './claim-list.module.scss';

interface Props {
  claims: Claim[];
}

export default function ClaimList(props: Props) {
  // We preload the payout data for the claim details pages
  useClaimPayoutDataPreload(props.claims);
  // We need to trigger a re-render the moment we go past a deadline
  const forceUpdate = useForceUpdate();

  return (
    <ul className={styles.claimList}>
      {props.claims.map((claim) => {
        const deadline = getCurrentDeadline(claim);
        const claimStatus = getClaimStatus(claim);
        const claimActions = getClaimActions(claim);

        return (
          <li key={claim.claimId}>
            <div className={styles.mobileStatusRow}>
              <span className={styles.status}>{claimStatus}</span>
              {claimActions && <div className={styles.pillContainer}>{claimActions}</div>}
            </div>
            <div className={styles.claimItem}>
              <div className={styles.claimItemMain}>
                <Link className={styles.claimItemTitle} to={`/claims/${claim.claimId}`}>
                  {claim.policy.metadata}
                </Link>

                <div className={styles.claimItemInfo}>
                  <span className={`${styles.status} ${styles.desktopInline}`}>{claimStatus}</span>
                  <span className={styles.createdAt}>
                    <span className={globalStyles.tertiaryColor}>Created: </span>
                    {format(claim.timestamp, 'dd MMM yyyy')}
                    <span className={globalStyles.tertiaryColor}> {format(claim.timestamp, 'HH:mm')}</span>
                  </span>

                  <span>
                    <span className={globalStyles.tertiaryColor}>Claim ID: </span>
                    {abbrStr(claim.claimId)}
                  </span>
                </div>
              </div>

              <div className={styles.actionInfo}>
                <div>
                  {claimActions && <div className={styles.pillContainer}>{claimActions}</div>}
                  {deadline && <Timer deadline={deadline} onDeadlineExceeded={forceUpdate} />}
                </div>
                <Link tabIndex={-1} to={`/claims/${claim.claimId}`}>
                  <img src={images.arrowRight} alt="right arrow" />
                </Link>
              </div>
            </div>
          </li>
        );
      })}
    </ul>
  );
}

function getClaimStatus(claim: Claim) {
  const { dispute } = claim;

  switch (claim.status) {
    case 'ClaimCreated':
      if (isAfter(new Date(), claim.deadline!)) {
        return (
          <>
            <Api3Icon aria-hidden /> API3 Mediators (rejected)
          </>
        );
      }

      return (
        <>
          <Api3Icon aria-hidden /> API3 Mediators (evaluating)
        </>
      );

    case 'SettlementProposed':
      if (isAfter(new Date(), claim.deadline!)) {
        return <span className={globalStyles.tertiaryColor}>Timed Out</span>;
      }

      return (
        <>
          <Api3Icon aria-hidden /> API3 Mediators (settlement)
        </>
      );

    case 'ClaimAccepted':
      return (
        <>
          <Api3Icon aria-hidden /> API3 Mediators (accepted)
        </>
      );

    case 'DisputeResolvedWithClaimPayout':
      return (
        <>
          <KlerosIcon aria-hidden /> Kleros (accepted)
        </>
      );

    case 'DisputeCreated':
      if (dispute?.status === 'Appealable') {
        switch (dispute.ruling) {
          case 'PayClaim':
            return (
              <>
                <KlerosIcon aria-hidden /> Kleros (accepted - appeal period)
              </>
            );

          case 'PaySettlement':
            return (
              <>
                <KlerosIcon aria-hidden /> Kleros (settlement - appeal period)
              </>
            );

          case 'DoNotPay':
            return (
              <>
                <KlerosIcon aria-hidden /> Kleros (rejected - appeal period)
              </>
            );
        }
      }

      if (dispute?.status === 'Solved') {
        switch (dispute.ruling) {
          case 'PayClaim':
            return (
              <>
                <KlerosIcon aria-hidden /> Kleros (accepted)
              </>
            );

          case 'PaySettlement':
            return (
              <>
                <KlerosIcon aria-hidden /> Kleros (settlement)
              </>
            );

          case 'DoNotPay':
            return (
              <>
                <KlerosIcon aria-hidden /> Kleros (rejected)
              </>
            );
        }
      }

      return (
        <>
          <KlerosIcon aria-hidden /> Kleros (evaluating)
        </>
      );

    case 'SettlementAccepted':
      return (
        <>
          <Api3Icon aria-hidden /> API3 Mediators (settled)
        </>
      );

    case 'DisputeResolvedWithSettlementPayout':
      return (
        <>
          <KlerosIcon aria-hidden /> Kleros (settled)
        </>
      );

    case 'DisputeResolvedWithoutPayout':
      return (
        <>
          <KlerosIcon aria-hidden /> Kleros (rejected)
        </>
      );

    case 'None':
      return null;
  }
}

function getClaimActions(claim: Claim) {
  const { dispute } = claim;

  const now = new Date();
  const isPastDeadline = claim.deadline ? isAfter(now, claim.deadline) : false;

  switch (claim.status) {
    case 'ClaimCreated': {
      if (isPastDeadline) {
        const isPastNewDeadline = isAfter(now, getCurrentDeadline(claim)!);
        if (!isPastNewDeadline) {
          return <div className={styles.pill}>Escalate to Kleros</div>;
        }
      }

      return null;
    }

    case 'SettlementProposed':
      if (isPastDeadline) return null;
      return (
        <>
          <div className={styles.pillExtra}>Escalate to Kleros</div>
          <div className={styles.pillPrimary}>Accept Settlement</div>
        </>
      );

    case 'DisputeCreated':
      if (dispute) {
        if (dispute.ruling !== 'PayClaim' && dispute.period === 'Appeal') {
          return <div className={styles.pill}>Appeal</div>;
        }

        if (dispute.ruling !== 'DoNotPay' && dispute.period === 'Execution') {
          return <div className={styles.pillPrimary}>Execute Payout</div>;
        }
      }

      return null;

    default:
      return null;
  }
}

const abbrStr = (str: string) => str.substr(0, 5) + '...' + str.substr(str.length - 4, str.length);
