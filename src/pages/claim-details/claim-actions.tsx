import { useState } from 'react';
import { BigNumber } from 'ethers';
import Button from '../../components/button';
import { Modal } from '../../components/modal';
import CheckIcon from '../../components/icons/check-icon';
import CloseIcon from '../../components/icons/close-icon';
import { AppealConfirmation, EscalateConfirmation } from './confirmations';
import PayoutAmount from './payout-amount';
import { abbrStr, Claim, ClaimPayout, useChainData } from '../../chain-data';
import { formatUsd, handleTransactionError } from '../../utils';
import { isAfter } from 'date-fns';
import { getEtherscanTransactionUrl, useArbitratorProxy, useClaimsManager } from '../../contracts';
import { getCurrentDeadline } from '../../logic/claims';
import styles from './claim-actions.module.scss';

interface Props {
  claim: Claim;
  payout: ClaimPayout | null;
}

export default function ClaimActions(props: Props) {
  const { claim } = props;
  const { dispute } = claim;
  const { setChainData, transactions, chainId } = useChainData();
  const claimsManager = useClaimsManager()!;
  const arbitratorProxy = useArbitratorProxy()!;

  const [modalToShow, setModalToShow] = useState<'escalate' | 'appeal' | null>(null);
  const [status, setStatus] = useState<'idle' | 'submitting' | 'submitted' | 'failed'>('idle');

  const isPastDeadline = claim.deadline ? isAfter(new Date(), claim.deadline) : false;
  const disableActions = isPastDeadline || status === 'submitting' || status === 'submitted';

  const handleAcceptCounter = async () => {
    setStatus('submitting');
    const tx = await handleTransactionError(
      claimsManager.acceptSettlement(claim.policy.id, claim.beneficiary, claim.claimAmountInUsd, claim.evidence, '0')
    );
    if (tx) {
      setChainData('Save accept claim settlement transaction', {
        transactions: [...transactions, { type: 'accept-claim-settlement', tx }],
      });
      setStatus('submitted');
    } else {
      setStatus('failed');
    }
  };

  const handleEscalateToArbitrator = async (arbitrationCost: BigNumber) => {
    setStatus('submitting');
    const tx = await handleTransactionError(
      arbitratorProxy.createDispute(
        claim.policy.id,
        claim.claimant,
        claim.beneficiary,
        claim.claimAmountInUsd,
        claim.evidence,
        { value: arbitrationCost }
      )
    );
    if (tx) {
      setChainData('Save escalate claim transaction', {
        transactions: [...transactions, { type: 'escalate-claim-to-arbitrator', tx }],
      });
      setStatus('submitted');
      setModalToShow(null);
    } else {
      setStatus('failed');
    }
  };

  const handleAppeal = async (appealCost: BigNumber) => {
    setStatus('submitting');
    const tx = await handleTransactionError(
      arbitratorProxy.appealKlerosArbitratorRuling(
        claim.policy.id,
        claim.claimant,
        claim.beneficiary,
        claim.claimAmountInUsd,
        claim.evidence,
        { value: appealCost }
      )
    );
    if (tx) {
      setChainData('Save appeal claim transaction', {
        transactions: [...transactions, { type: 'appeal-claim-decision', tx }],
      });
      setStatus('submitted');
      setModalToShow(null);
    } else {
      setStatus('failed');
    }
  };

  const handleModalClose = () => setModalToShow(null);

  switch (claim.status) {
    case 'ClaimCreated':
      if (isPastDeadline) {
        // The claim has been ignored (most likely judged to be spam), so we show that it has
        // been rejected, and the user has 3 days to create a dispute
        const isPastNewDeadline = isAfter(new Date(), getCurrentDeadline(claim)!);
        const disableEscalate = isPastNewDeadline || status === 'submitting' || status === 'submitted';
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
              <Button variant="secondary" disabled={disableEscalate} onClick={() => setModalToShow('escalate')}>
                Escalate to Kleros
              </Button>
              <Modal open={modalToShow === 'escalate'} onClose={handleModalClose}>
                <EscalateConfirmation
                  disableActions={disableEscalate}
                  onConfirm={handleEscalateToArbitrator}
                  onCancel={handleModalClose}
                />
              </Modal>
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

    case 'ClaimAccepted': {
      const payout = props.payout!;
      return (
        <div className={styles.actionSection}>
          <p>API3 Multi-sig</p>
          <div className={styles.actionMainInfo}>
            <span className={styles.approved}>
              <CheckIcon aria-hidden />
              Approved
            </span>
            <div>${formatUsd(claim.claimAmountInUsd)} USD</div>
            <PayoutAmount claim={claim} payout={payout} />
          </div>
          <p className={styles.actionMessage}>All done! The claim payout has been accepted.</p>
          <a
            href={getEtherscanTransactionUrl(chainId, payout.transactionHash)}
            target="_blank"
            rel="noopener noreferrer"
            className="link-primary"
          >
            View the transaction here
          </a>
        </div>
      );
    }

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
            <Button variant="secondary" disabled={disableActions} onClick={() => setModalToShow('escalate')}>
              Escalate to Kleros
            </Button>
            <Modal open={modalToShow === 'escalate'} onClose={handleModalClose}>
              <EscalateConfirmation
                disableActions={disableActions}
                onConfirm={handleEscalateToArbitrator}
                onCancel={handleModalClose}
              />
            </Modal>
          </div>
          <p className={styles.actionMessage}>
            You can take action within the given time frame or the counter offer will be automatically accepted.
          </p>
        </div>
      );

    case 'SettlementAccepted': {
      const payout = props.payout!;
      return (
        <div className={styles.actionSection}>
          <p>{abbrStr(claim.claimant)}</p>
          <div className={styles.actionMainInfo}>
            Accepted <br />
            counter of <br />${formatUsd(claim.counterOfferAmountInUsd!)}
            <PayoutAmount claim={claim} payout={props.payout!} />
          </div>
          <p className={styles.actionMessage}>All done! The settlement has been accepted.</p>
          <a
            href={getEtherscanTransactionUrl(chainId, payout.transactionHash)}
            target="_blank"
            rel="noopener noreferrer"
            className="link-primary"
          >
            View the transaction here
          </a>
        </div>
      );
    }

    case 'DisputeCreated':
      if (!dispute || dispute.status === 'Waiting') {
        if (dispute?.appealedBy) {
          return (
            <div className={styles.actionSection}>
              <p>{dispute.appealedBy === claim.claimant ? abbrStr(claim.claimant) : 'API3 Multi-sig'}</p>
              <div className={styles.actionMainInfo}>Appealed to Kleros</div>
              <p className={styles.actionMessage}>Kleros will decide the outcome of your claim again.</p>
            </div>
          );
        }

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
                <Button variant="secondary" disabled={disableActions} onClick={() => setModalToShow('appeal')}>
                  Appeal
                </Button>
                <Modal open={modalToShow === 'appeal'} onClose={handleModalClose}>
                  <AppealConfirmation
                    disputeId={claim.dispute!.id}
                    disableActions={disableActions}
                    onConfirm={handleAppeal}
                    onCancel={handleModalClose}
                  />
                </Modal>
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
                <Button variant="secondary" disabled={disableActions} onClick={() => setModalToShow('appeal')}>
                  Appeal
                </Button>
                <Modal open={modalToShow === 'appeal'} onClose={handleModalClose}>
                  <AppealConfirmation
                    disputeId={claim.dispute!.id}
                    disableActions={disableActions}
                    onConfirm={handleAppeal}
                    onCancel={handleModalClose}
                  />
                </Modal>
              </div>
              <p className={styles.actionMessage}>
                You can appeal within the given time frame or the rejection will be automatically accepted.
              </p>
            </div>
          );

        default:
          return null;
      }

    case 'DisputeResolvedWithClaimPayout': {
      const payout = props.payout!;
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
            <PayoutAmount claim={claim} payout={props.payout!} />
          </div>
          <p className={styles.actionMessage}>All done! The claim has been paid out.</p>
          <a
            href={getEtherscanTransactionUrl(chainId, payout.transactionHash)}
            target="_blank"
            rel="noopener noreferrer"
            className="link-primary"
          >
            View the transaction here
          </a>
        </div>
      );
    }

    case 'DisputeResolvedWithSettlementPayout': {
      const payout = props.payout!;
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
            <PayoutAmount claim={claim} payout={props.payout!} />
          </div>
          <p className={styles.actionMessage}>All done! The settlement has been paid out.</p>
          <a
            href={getEtherscanTransactionUrl(chainId, payout.transactionHash)}
            target="_blank"
            rel="noopener noreferrer"
            className="link-primary"
          >
            View the transaction here
          </a>
        </div>
      );
    }

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
