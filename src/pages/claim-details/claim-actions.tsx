import { useState } from 'react';
import Button from '../../components/button';
import CheckIcon from '../../components/icons/check-icon';
import CloseIcon from '../../components/icons/close-icon';
import { abbrStr, Claim, useChainData } from '../../chain-data';
import styles from './claim-actions.module.scss';
import { formatApi3, handleTransactionError } from '../../utils';
import { isAfter } from 'date-fns';
import { useClaimsManager } from '../../contracts';
import { BigNumber } from 'ethers';
import { getCurrentDeadline } from '../../logic/claims';

interface Props {
  claim: Claim;
}

export default function ClaimActions(props: Props) {
  const { claim } = props;
  const { setChainData, transactions } = useChainData();
  const claimsManager = useClaimsManager()!;
  const [status, setStatus] = useState<'idle' | 'submitting' | 'submitted' | 'failed'>('idle');

  const isPastDeadline = claim.deadline ? isAfter(new Date(), claim.deadline) : false;
  const disableActions = isPastDeadline || status === 'submitting' || status === 'submitted';

  const handleAcceptCounter = async () => {
    setStatus('submitting');
    const tx = await handleTransactionError(claimsManager.acceptSettlement(BigNumber.from(claim.claimId)));
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
    const tx = await handleTransactionError(
      claimsManager.createDisputeWithKlerosArbitrator(BigNumber.from(claim.claimId))
    );
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
    const tx = await handleTransactionError(
      claimsManager.appealKlerosArbitratorDecision(BigNumber.from(claim.claimId), claim.arbitratorDisputeId!)
    );
    if (tx) {
      setChainData('Save appeal claim transaction', {
        transactions: [...transactions, { type: 'appeal-claim-decision', tx }],
      });
      setStatus('submitted');
    } else {
      setStatus('failed');
    }
  };

  // TODO DAO-151 Add additional info messages for the different statuses
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
                type="secondary"
                disabled={isPastNewDeadline || status === 'submitting' || status === 'submitted'}
                onClick={handleEscalateToArbitrator}
              >
                Escalate to Kleros
              </Button>
            </div>
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
            Countered with <br />
            {formatApi3(claim.counterOfferAmount!)} API3
          </div>
          <div className={styles.actionPanel}>
            <Button type="primary" disabled={disableActions} onClick={handleAcceptCounter}>
              Accept Counter
            </Button>
            <Button type="secondary" disabled={disableActions} onClick={handleEscalateToArbitrator}>
              Escalate to Kleros
            </Button>
          </div>
        </div>
      );

    case 'SettlementAccepted':
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

    case 'DisputeCreated':
      if (isPastDeadline) {
        // The claim has been ignored (most likely judged to be spam), so we show that it has been rejected
        return (
          <div className={styles.actionSection}>
            <p>Kleros</p>
            <div className={styles.actionMainInfo}>
              <span className={styles.rejected}>
                <CloseIcon aria-hidden />
                Rejected
              </span>
            </div>
          </div>
        );
      }

      return (
        <div className={styles.actionSection}>
          <p>{abbrStr(claim.claimant)}</p>
          {claim.counterOfferAmount?.gt(0) ? (
            <div className={styles.actionMainInfo}>
              Appealed counter of <br />
              {formatApi3(claim.counterOfferAmount)} API3 <br />
              to Kleros
            </div>
          ) : (
            <div className={styles.actionMainInfo}>Appealed to Kleros</div>
          )}
        </div>
      );

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
            <br />
            {formatApi3(claim.counterOfferAmount!)} API3
          </div>
          <div className={styles.actionPanel}>
            <Button type="secondary" disabled={disableActions} onClick={handleAppeal}>
              Appeal
            </Button>
          </div>
        </div>
      );

    case 'DisputeResolvedWithoutPayout':
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

    case 'TimedOut':
      return (
        <div className={styles.actionSection}>
          <div className={styles.actionMainInfo}>Timed Out</div>
        </div>
      );

    case 'None':
      return null;
  }
}
