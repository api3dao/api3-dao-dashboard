import { Link } from 'react-router-dom';
import Timer from '../../components/timer';
import Api3Icon from '../../components/icons/api3-icon';
import KlerosIcon from '../../components/icons/kleros-icon';
import WarningIcon from '../../components/icons/warning-icon';
import { format, isAfter } from 'date-fns';
import { images, useForceUpdate } from '../../utils';
import { Claim } from '../../chain-data';
import { getCurrentDeadline, isActive, useClaimPayoutDataPreload } from '../../logic/claims';
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
        const active = isActive(claim);
        const isPastDeadline = claim.deadline ? isAfter(new Date(), claim.deadline) : false;
        const claimStatus = getClaimStatus(claim, isPastDeadline);
        const pills = active
          ? getClaimActions(claim, isPastDeadline) || <div className={styles.pillDisabled}>No Action Available</div>
          : null;

        const currentDeadline = getCurrentDeadline(claim);
        const showDeadline = active && !!currentDeadline;

        return (
          <li
            key={claim.claimId}
            data-active={active}
            data-status={claim.status}
            data-dispute-status={claim.dispute?.status}
            data-show-deadline={showDeadline}
          >
            <div className={styles.mobileStatusRow}>
              <span className={styles.status}>{claimStatus}</span>
              {pills && <div className={styles.pillContainer}>{pills}</div>}
            </div>
            <div className={styles.claimItem}>
              <div className={styles.claimItemMain}>
                <Link className={styles.claimItemTitle} to={`/claims/${claim.claimId}`}>
                  {claim.status === 'SettlementProposed' && !isPastDeadline && <WarningIcon aria-hidden />}
                  {claim.policy.metadata}
                </Link>

                <div className={styles.claimItemInfo}>
                  <span data-testid="claim-status" className={styles.desktopStatus}>
                    {claimStatus}
                  </span>

                  <span className={styles.claimId}>
                    <span className={globalStyles.tertiaryColor}>Claim ID: </span>
                    {abbrStr(claim.claimId)}
                  </span>

                  <span className={styles.createdAt}>
                    <span className={globalStyles.tertiaryColor}>Created: </span>
                    {format(claim.timestamp, 'dd MMM yyyy')}
                    <span className={globalStyles.tertiaryColor}> {format(claim.timestamp, 'HH:mm')}</span>
                  </span>
                </div>
              </div>

              <div className={styles.actionInfo} data-testid="claim-action-info">
                {pills && <div className={styles.pillContainer}>{pills}</div>}
                {showDeadline && <Timer deadline={currentDeadline} onDeadlineExceeded={forceUpdate} />}
              </div>
              <Link className={styles.arrowIconLink} tabIndex={-1} to={`/claims/${claim.claimId}`}>
                <img src={images.arrowRight} alt="right arrow" />
              </Link>
            </div>
          </li>
        );
      })}
    </ul>
  );
}

function getClaimStatus(claim: Claim, isPastDeadline: boolean) {
  const { dispute } = claim;

  switch (claim.status) {
    case 'ClaimCreated':
      if (isPastDeadline) {
        return (
          <>
            <Api3Icon aria-hidden />
            API3 Mediators (rejected)
          </>
        );
      }

      return (
        <>
          <Api3Icon aria-hidden />
          API3 Mediators (evaluating)
        </>
      );

    case 'SettlementProposed':
      if (isPastDeadline) {
        return <span className={globalStyles.tertiaryColor}>Timed Out</span>;
      }

      return (
        <>
          <Api3Icon aria-hidden />
          API3 Mediators (settlement)
        </>
      );

    case 'ClaimAccepted':
      return (
        <>
          <Api3Icon aria-hidden />
          API3 Mediators (accepted)
        </>
      );

    case 'DisputeResolvedWithClaimPayout':
      return (
        <>
          <KlerosIcon aria-hidden />
          Kleros (accepted)
        </>
      );

    case 'DisputeCreated':
      if (dispute?.status === 'Appealable') {
        switch (dispute.ruling) {
          case 'PayClaim':
            return (
              <>
                <KlerosIcon aria-hidden />
                Kleros (accepted - appeal period)
              </>
            );

          case 'PaySettlement':
            return (
              <>
                <KlerosIcon aria-hidden />
                Kleros (settlement - appeal period)
              </>
            );

          case 'DoNotPay':
            return (
              <>
                <KlerosIcon aria-hidden />
                Kleros (rejected - appeal period)
              </>
            );
        }
      }

      if (dispute?.status === 'Solved') {
        switch (dispute.ruling) {
          case 'PayClaim':
            return (
              <>
                <KlerosIcon aria-hidden />
                Kleros (accepted)
              </>
            );

          case 'PaySettlement':
            return (
              <>
                <KlerosIcon aria-hidden />
                Kleros (settlement)
              </>
            );

          case 'DoNotPay':
            return (
              <>
                <KlerosIcon aria-hidden />
                Kleros (rejected)
              </>
            );
        }
      }

      return (
        <>
          <KlerosIcon aria-hidden />
          Kleros (evaluating)
        </>
      );

    case 'SettlementAccepted':
      return (
        <>
          <Api3Icon aria-hidden />
          API3 Mediators (settled)
        </>
      );

    case 'DisputeResolvedWithSettlementPayout':
      return (
        <>
          <KlerosIcon aria-hidden />
          Kleros (settled)
        </>
      );

    case 'DisputeResolvedWithoutPayout':
      return (
        <>
          <KlerosIcon aria-hidden />
          Kleros (rejected)
        </>
      );

    case 'None':
      return null;
  }
}

function getClaimActions(claim: Claim, isPastDeadline: boolean) {
  const { dispute } = claim;

  switch (claim.status) {
    case 'ClaimCreated': {
      if (isPastDeadline) {
        const isPastNewDeadline = isAfter(new Date(), getCurrentDeadline(claim)!);
        if (!isPastNewDeadline) {
          return (
            <div className={styles.pill} data-testid="action">
              Escalate to Kleros
            </div>
          );
        }
      }

      return null;
    }

    case 'SettlementProposed':
      if (isPastDeadline) return null;
      return (
        <>
          <div className={styles.pillExtra} data-testid="action">
            Escalate to Kleros
          </div>
          <div className={styles.pillPrimary} data-testid="action">
            Accept Settlement
          </div>
        </>
      );

    case 'DisputeCreated':
      if (dispute) {
        if (dispute.ruling !== 'PayClaim' && dispute.period === 'Appeal') {
          return (
            <div className={styles.pill} data-testid="action">
              Appeal
            </div>
          );
        }

        if (dispute.ruling !== 'DoNotPay' && dispute.period === 'Execution') {
          return (
            <div className={styles.pillPrimary} data-testid="action">
              Execute Payout
            </div>
          );
        }
      }

      return null;

    default:
      return null;
  }
}

const abbrStr = (str: string) => str.substr(0, 5) + '...' + str.substr(str.length - 4, str.length);
