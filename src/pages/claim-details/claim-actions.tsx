import { useState } from 'react';
import Button from '../../components/button';
import CheckIcon from '../../components/icons/check-icon';
import CloseIcon from '../../components/icons/close-icon';
import { abbrStr, Claim, useChainData } from '../../chain-data';
import styles from './claim-actions.module.scss';
import { formatApi3, formatUsd, handleTransactionError } from '../../utils';
import { isAfter } from 'date-fns';
import { useArbitratorProxy, useClaimsManager } from '../../contracts';
import { getCurrentDeadline } from '../../logic/claims';

interface Props {
  claim: Claim;
}

export default function ClaimActions(props: Props) {
  const { claim } = props;
  const { dispute } = claim;
  const { setChainData, transactions } = useChainData();
  const claimsManager = useClaimsManager()!;
  const arbitratorProxy = useArbitratorProxy()!;
  const [status, setStatus] = useState<'idle' | 'submitting' | 'submitted' | 'failed'>('idle');

  const isPastDeadline = claim.deadline ? isAfter(new Date(), claim.deadline) : false;
  const disableActions = isPastDeadline || status === 'submitting' || status === 'submitted';

  const handleAcceptCounter = async () => {
    setStatus('submitting');
    const tx = await handleTransactionError(claimsManager.acceptSettlement(claim.claimId));
    if (tx) {
      setChainData('Save accept claim settlement transaction', {
        transactions: [...transactions, { type: 'accept-claim-settlement', tx }],
      });
      setStatus('submitted');
    } else {
      setStatus('failed');
    }
  };

  const handleEscalateToArbitrator = async () => {
    setStatus('submitting');
    const tx = await handleTransactionError(arbitratorProxy.createDispute(claim.claimId));
    if (tx) {
      setChainData('Save escalate claim transaction', {
        transactions: [...transactions, { type: 'escalate-claim-to-arbitrator', tx }],
      });
      setStatus('submitted');
    } else {
      setStatus('failed');
    }
  };

  const handleAppeal = async () => {
    setStatus('submitting');
    const tx = await handleTransactionError(arbitratorProxy.appealKlerosArbitratorRuling(claim.claimId));
    if (tx) {
      setChainData('Save appeal claim transaction', {
        transactions: [...transactions, { type: 'appeal-claim-decision', tx }],
      });
      setStatus('submitted');
    } else {
      setStatus('failed');
    }
  };

  switch (claim.status) {
    case 'ClaimCreated':
      if (isPastDeadline) {
        // The claim has been ignored (most likely judged to be spam), so we show that it has
        // been rejected, and the user has 3 days to create a dispute
        const isPastNewDeadline = isAfter(new Date(), getCurrentDeadline(claim)!);
        return (
          <div className={styles.actionSection}>
            <p>API3 Multi-sig</p>
            <div className={styles.actionMainInfo}>
              <span className={styles.rejected}>
                <CloseIcon aria-hidden />
                Rejected
              </span>
            </div>
            <div className={styles.actionPanel}>
              <Button
                variant="secondary"
                disabled={isPastNewDeadline || status === 'submitting' || status === 'submitted'}
                onClick={handleEscalateToArbitrator}
              >
                Escalate to Kleros
              </Button>
            </div>
            <p className={styles.actionMessage}>
              You can escalate within the given time frame or the rejection will be automatically accepted.
            </p>
          </div>
        );
      }

      return (
        <div className={styles.actionSection}>
          <p>API3 Multi-sig</p>
          <div className={styles.actionMainInfo}>Processing</div>
        </div>
      );

    case 'ClaimAccepted':
      return (
        <div className={styles.actionSection}>
          <p>API3 Multi-sig</p>
          <div className={styles.actionMainInfo}>
            <span className={styles.approved}>
              <CheckIcon aria-hidden />
              Approved
            </span>
          </div>
        </div>
      );

    case 'SettlementProposed':
      return (
        <div className={styles.actionSection}>
          <p>API3 Multi-sig</p>
          <div className={styles.actionMainInfo}>
            Countered with <br />${formatUsd(claim.counterOfferAmountInUsd!)}
          </div>
          <div className={styles.actionPanel}>
            <Button variant="primary" disabled={disableActions} onClick={handleAcceptCounter}>
              Accept Counter
            </Button>
            <Button variant="secondary" disabled={disableActions} onClick={handleEscalateToArbitrator}>
              Escalate to Kleros
            </Button>
          </div>
          <p className={styles.actionMessage}>
            You can take action within the given time frame or the counter offer will be automatically accepted.
          </p>
        </div>
      );

    case 'SettlementAccepted':
      return (
        <div className={styles.actionSection}>
          <p>{abbrStr(claim.claimant)}</p>
          <div className={styles.actionMainInfo}>
            Accepted <br />
            counter of <br />${formatUsd(claim.counterOfferAmountInUsd!)}
          </div>
        </div>
      );

    case 'DisputeCreated':
      if (!dispute || dispute.status === 'Waiting') {
        return (
          <div className={styles.actionSection}>
            <p>{abbrStr(claim.claimant)}</p>
            {claim.counterOfferAmountInUsd?.gt(0) ? (
              <div className={styles.actionMainInfo}>
                Escalated counter of <br />${formatUsd(claim.counterOfferAmountInUsd!)} <br />
                to Kleros
              </div>
            ) : (
              <div className={styles.actionMainInfo}>Escalated to Kleros</div>
            )}
            <p className={styles.actionMessage}>Kleros will decide the outcome of your claim.</p>
          </div>
        );
      }

      switch (dispute.ruling) {
        case 'PayClaim':
          return (
            <div className={styles.actionSection}>
              <p>Kleros</p>
              <div className={styles.actionMainInfo} data-testid="status-message">
                <span className={styles.approved}>
                  <CheckIcon aria-hidden />
                  Approved
                </span>
                <br />
                {' full amount'}
              </div>
            </div>
          );

        case 'PaySettlement':
          return (
            <div className={styles.actionSection}>
              <p>Kleros</p>
              <div className={styles.actionMainInfo} data-testid="status-message">
                <span className={styles.approved}>
                  <CheckIcon aria-hidden />
                  Approved
                </span>
                <br />
                {' counter of '}
                <br />${formatUsd(claim.counterOfferAmountInUsd!)}
              </div>
              <div className={styles.actionPanel}>
                <Button variant="secondary" disabled={disableActions} onClick={handleAppeal}>
                  Appeal
                </Button>
              </div>
              <p className={styles.actionMessage}>
                You can appeal within the given time frame or the counter offer will be automatically accepted.
              </p>
            </div>
          );

        case 'DoNotPay':
          return (
            <div className={styles.actionSection}>
              <p>Kleros</p>
              <div className={styles.actionMainInfo}>Rejected</div>
              <div className={styles.actionPanel}>
                <Button variant="secondary" disabled={disableActions} onClick={handleAppeal}>
                  Appeal
                </Button>
              </div>
              <p className={styles.actionMessage}>
                You can appeal within the given time frame or the rejection will be automatically accepted.
              </p>
            </div>
          );

        default:
          return null;
      }

    case 'DisputeResolvedWithClaimPayout':
      return (
        <div className={styles.actionSection}>
          <p>Kleros</p>
          <div className={styles.actionMainInfo} data-testid="status-message">
            <span className={styles.approved}>
              <CheckIcon aria-hidden />
              Approved
            </span>
            <br />
            {' full amount'}
          </div>
        </div>
      );

    case 'DisputeResolvedWithSettlementPayout':
      return (
        <div className={styles.actionSection}>
          <p>Kleros</p>
          <div className={styles.actionMainInfo} data-testid="status-message">
            <span className={styles.approved}>
              <CheckIcon aria-hidden />
              Approved
            </span>
            <br />
            {' counter of '}
            <br />${formatUsd(claim.counterOfferAmountInUsd!)}
          </div>
        </div>
      );

    case 'DisputeResolvedWithoutPayout':
      return (
        <div className={styles.actionSection}>
          <p>Kleros</p>
          <div className={styles.actionMainInfo}>Rejected</div>
        </div>
      );

    case 'None':
      return null;
  }
}
