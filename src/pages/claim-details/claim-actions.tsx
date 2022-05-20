import { useState } from 'react';
import Button from '../../components/button';
import { abbrStr, Claim } from '../../chain-data';
import styles from './claim-actions.module.scss';
import { formatApi3 } from '../../utils';
import { isAfter } from 'date-fns';

interface Props {
  claim: Claim;
}

export default function ClaimActions(props: Props) {
  const { claim } = props;
  const [status, setStatus] = useState<'idle' | 'submitting' | 'submitted' | 'failed'>('idle');
  const isPastDeadline = claim.deadline ? isAfter(new Date(), claim.deadline) : false;
  const disableActions = !claim.open || isPastDeadline || status === 'submitting' || status === 'submitted';

  // TODO DAO-151 Implement
  const handleAcceptCounter = () => {
    setStatus('submitting');
  };

  // TODO DAO-151 Implement
  const handleAppeal = () => {
    setStatus('submitting');
  };

  // TODO DAO-151 Add additional info messages for the different statuses
  switch (claim.status) {
    case 'Submitted':
      return (
        <div className={styles.actionSection}>
          <p>API3 Multi-sig</p>
          <div className={styles.actionMainInfo}>Processing</div>
        </div>
      );

    case 'MediationOffered':
      return (
        <div className={styles.actionSection}>
          <p>API3 Multi-sig</p>
          <div className={styles.actionMainInfo}>
            Countered with <br />
            {formatApi3(claim.counterOfferAmount!)} API3
          </div>
          <div className={styles.actionPanel}>
            <Button type="primary" disabled={disableActions} onClick={handleAcceptCounter}>
              Accept Counter
            </Button>
            <Button type="secondary" disabled={disableActions} onClick={handleAppeal}>
              Escalate to Kleros
            </Button>
          </div>
        </div>
      );

    case 'Accepted':
      return (
        <div className={styles.actionSection}>
          <p>{abbrStr(claim.claimant)}</p>
          <div className={styles.actionMainInfo}>
            Accepted <br />
            counter of <br />
            {formatApi3(claim.counterOfferAmount!)} API3
          </div>
        </div>
      );

    case 'Appealed':
      return (
        <div className={styles.actionSection}>
          <p>{abbrStr(claim.claimant)}</p>
          {claim.counterOfferAmount ? (
            <div className={styles.actionMainInfo}>
              Appealed counter of <br />
              {formatApi3(claim.counterOfferAmount!)} API3 <br />
              to Kleros
            </div>
          ) : (
            <div className={styles.actionMainInfo}>Appealed to Kleros</div>
          )}
        </div>
      );

    case 'Rejected':
      if (claim.statusUpdatedBy === 'arbitrator') {
        return (
          <div className={styles.actionSection}>
            <p>Kleros</p>
            <div className={styles.actionMainInfo}>Rejected</div>
            <div className={styles.actionPanel}>
              <Button type="secondary" disabled={disableActions} onClick={handleAppeal}>
                Appeal
              </Button>
            </div>
          </div>
        );
      }

      return (
        <div className={styles.actionSection}>
          <p>API3 Multi-sig</p>
          <div className={styles.actionMainInfo}>Rejected</div>
          <div className={styles.actionPanel}>
            <Button type="secondary" disabled={disableActions} onClick={handleAppeal}>
              Escalate to Kleros
            </Button>
          </div>
        </div>
      );

    case 'Resolved':
      if (claim.statusUpdatedBy === 'arbitrator') {
        return (
          <div className={styles.actionSection}>
            <p>Kleros</p>
            <div className={styles.actionMainInfo}>
              Approved <br />
              counter of <br />
              {formatApi3(claim.resolvedAmount!)} API3
            </div>
            <div className={styles.actionPanel}>
              <Button type="secondary" disabled={disableActions} onClick={handleAppeal}>
                Appeal
              </Button>
            </div>
          </div>
        );
      }

      return (
        <div className={styles.actionSection}>
          <p>API3 Multi-sig</p>
          <div className={styles.actionMainInfo}>Approved</div>
        </div>
      );

    default:
      return null;
  }
}
