import { useState } from 'react';
import { BigNumber } from 'ethers';
import Button from '../../components/button';
import ExternalLink from '../../components/external-link';
import { Modal } from '../../components/modal';
import CheckIcon from '../../components/icons/check-icon';
import CloseIcon from '../../components/icons/close-icon';
import Api3Icon from '../../components/icons/api3-icon';
import WarningIcon from '../../components/icons/warning-icon';
import { AppealConfirmation, EscalateConfirmation } from './confirmations';
import PayoutAmount from './payout-amount';
import { Claim, ClaimPayout, useChainData } from '../../chain-data';
import { formatUsd, handleTransactionError } from '../../utils';
import { isAfter } from 'date-fns';
import { getEtherscanTransactionUrl, useArbitratorProxy, useClaimsManager } from '../../contracts';
import { getCurrentDeadline } from '../../logic/claims';
import styles from './claim-actions.module.scss';
import KlerosIcon from '../../components/icons/kleros-icon';

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

  const handleExecutePayout = async () => {
    setStatus('submitting');
    const tx = await handleTransactionError(arbitratorProxy.executeRuling(claim.dispute!.id));
    if (tx) {
      setChainData('Execute claim payout transaction', {
        transactions: [...transactions, { type: 'execute-claim-payout', tx }],
      });
      setStatus('submitted');
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
            <p className={styles.mediator}>
              <Api3Icon aria-hidden /> API3 Mediators
            </p>
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
              If you don’t escalate to Kleros within the remaining time, the rejection will be accepted
            </p>
          </div>
        );
      }

      return (
        <div className={styles.actionSection}>
          <p className={styles.mediator}>
            <Api3Icon aria-hidden /> API3 Mediators
          </p>
          <div className={styles.actionMainInfo}>Evaluating</div>
          <p className={styles.actionMessage}>API3 Mediators are currently evaluating your claim</p>
        </div>
      );

    case 'ClaimAccepted': {
      const payout = props.payout!;
      const amountToPayInUsd = getAmountToPayInUsd(claim);

      return (
        <div className={styles.actionSection}>
          <p className={styles.mediator}>
            <Api3Icon aria-hidden /> API3 Mediators
          </p>
          <div className={styles.actionMainInfo}>
            <span className={styles.approved}>
              <CheckIcon aria-hidden />
              Accepted
            </span>
            <div>{formatUsd(payout.amountInUsd)} USD</div>
            <PayoutAmount claim={claim} payout={payout} />
          </div>
          <p className={styles.actionMessage}>All done! The claim payout has been accepted.</p>
          <ExternalLink href={getEtherscanTransactionUrl(chainId, payout.transactionHash)} className="link-primary">
            View the transaction here
          </ExternalLink>
          {payout.amountInUsd.lt(amountToPayInUsd) && (
            <p className={styles.coverageMessage}>
              <WarningIcon aria-hidden className={styles.warningIcon} />
              The full payout ({formatUsd(amountToPayInUsd)} USD) exceeded the remaining coverage. The remaining
              coverage was paid out
            </p>
          )}
        </div>
      );
    }

    case 'SettlementProposed':
      return (
        <div className={styles.actionSection}>
          <p className={styles.mediator}>
            <Api3Icon aria-hidden /> API3 Mediators
          </p>
          <div className={styles.actionMainInfo}>
            Offered Settlement <br />
            {formatUsd(claim.settlementAmountInUsd!)} USD
          </div>
          <div className={styles.actionPanel}>
            <Button variant="secondary" disabled={disableActions} onClick={() => setModalToShow('escalate')}>
              Escalate to Kleros
            </Button>
            <Button variant="secondary" disabled={disableActions} onClick={handleAcceptCounter}>
              Accept Settlement
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
            <WarningIcon aria-hidden className={styles.warningIcon} />A selection must be made within the remaining time
            or the claim will time out and no payout will be received. Escalating to Kleros may result in the entire
            claim being rejected.
          </p>
        </div>
      );

    case 'SettlementAccepted': {
      const payout = props.payout!;
      const amountToPayInUsd = getAmountToPayInUsd(claim);

      return (
        <div className={styles.actionSection}>
          <p className={styles.mediator}>
            <Api3Icon aria-hidden /> API3 Mediators
          </p>
          <div className={styles.actionMainInfo}>
            Settled <br />
            {formatUsd(payout.amountInUsd)} USD
            <PayoutAmount claim={claim} payout={payout} />
          </div>
          <p className={styles.actionMessage}>All done! The settlement was accepted and paid out.</p>
          <ExternalLink href={getEtherscanTransactionUrl(chainId, payout.transactionHash)} className="link-primary">
            View the transaction here
          </ExternalLink>
          {payout.amountInUsd.lt(amountToPayInUsd) && (
            <p className={styles.coverageMessage}>
              <WarningIcon aria-hidden className={styles.warningIcon} />
              The full settlement ({formatUsd(amountToPayInUsd)} USD) exceeded the remaining coverage. The remaining
              coverage was paid out
            </p>
          )}
        </div>
      );
    }

    case 'DisputeCreated':
      if (!dispute || dispute.status === 'Waiting') {
        if (dispute?.appealedBy) {
          return (
            <div className={styles.actionSection}>
              <p className={styles.arbitrator}>
                <KlerosIcon aria-hidden />
                Kleros
              </p>
              <div className={styles.actionMainInfo}>Evaluating</div>
              {dispute.appealedBy === claim.claimant ? (
                <p className={styles.actionMessage}>
                  You appealed Kleros’s ruling. Kleros jurors are currently evaluating your claim
                </p>
              ) : (
                <p className={styles.actionMessage}>
                  The API3 Mediators appealed Kleros’s ruling. Kleros jurors are currently evaluating your claim
                </p>
              )}
            </div>
          );
        }

        return (
          <div className={styles.actionSection}>
            <p className={styles.arbitrator}>
              <KlerosIcon aria-hidden />
              Kleros
            </p>
            <div className={styles.actionMainInfo}>Evaluating</div>
            <p className={styles.actionMessage}>
              The claim was escalated to Kleros. Kleros jurors are currently evaluating your claim
            </p>
          </div>
        );
      }

      switch (dispute.ruling) {
        case 'PayClaim':
          return (
            <div className={styles.actionSection}>
              {dispute.period === 'Appeal' && <h5 style={{ marginBottom: 40 }}>Appeal Period</h5>}
              <p className={styles.arbitrator}>
                <KlerosIcon aria-hidden />
                Kleros
              </p>
              <div className={styles.actionMainInfo} data-testid="status-message">
                <span className={styles.approved}>
                  <CheckIcon aria-hidden />
                  Accepted
                </span>
                <br />
                {formatUsd(claim.claimAmountInUsd)} USD
              </div>
              {dispute.period === 'Appeal' && (
                <p className={styles.actionMessage}>
                  During this appeal period the API3 Mediators have the opportunity to appeal Kleros’s ruling
                </p>
              )}
              {dispute.period === 'Execution' && (
                <div className={styles.actionPanel}>
                  <Button variant="secondary" disabled={disableActions} onClick={handleExecutePayout}>
                    Execute Payout
                  </Button>
                </div>
              )}
            </div>
          );

        case 'PaySettlement':
          return (
            <div className={styles.actionSection}>
              {dispute.period === 'Appeal' && <h5 style={{ marginBottom: 40 }}>Appeal Period</h5>}
              <p className={styles.arbitrator}>
                <KlerosIcon aria-hidden />
                Kleros
              </p>
              <div className={styles.actionMainInfo} data-testid="status-message">
                Accepted Settlement
                <br />
                <span>{formatUsd(claim.settlementAmountInUsd!)} USD</span>
              </div>
              {dispute.period === 'Appeal' && (
                <>
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
                    During this appeal period you have the opportunity to appeal Kleros’s ruling
                  </p>
                </>
              )}
              {dispute.period === 'Execution' && (
                <div className={styles.actionPanel}>
                  <Button variant="secondary" disabled={disableActions} onClick={handleExecutePayout}>
                    Execute Payout
                  </Button>
                </div>
              )}
            </div>
          );

        case 'DoNotPay':
          return (
            <div className={styles.actionSection}>
              {dispute.period === 'Appeal' && <h5 style={{ marginBottom: 40 }}>Appeal Period</h5>}
              <p className={styles.arbitrator}>
                <KlerosIcon aria-hidden />
                Kleros
              </p>
              <div className={styles.actionMainInfo}>
                <span className={styles.rejected}>
                  <CloseIcon aria-hidden />
                  Rejected
                </span>
              </div>
              {dispute.period === 'Appeal' && (
                <>
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
                    During this appeal period you have the opportunity to appeal Kleros’s ruling
                  </p>
                </>
              )}
            </div>
          );

        default:
          return null;
      }

    case 'DisputeResolvedWithClaimPayout': {
      const payout = props.payout!;
      const amountToPayInUsd = getAmountToPayInUsd(claim);

      return (
        <div className={styles.actionSection}>
          <p className={styles.arbitrator}>
            <KlerosIcon aria-hidden />
            Kleros
          </p>
          <div className={styles.actionMainInfo} data-testid="status-message">
            <span className={styles.approved}>
              <CheckIcon aria-hidden />
              Accepted
            </span>
            <br />
            {formatUsd(payout.amountInUsd)} USD
            <PayoutAmount claim={claim} payout={payout} />
          </div>
          <p className={styles.actionMessage}>All done! The claim payout has been accepted.</p>
          <ExternalLink href={getEtherscanTransactionUrl(chainId, payout.transactionHash)} className="link-primary">
            View the transaction here
          </ExternalLink>
          {payout.amountInUsd.lt(amountToPayInUsd) && (
            <p className={styles.coverageMessage}>
              <WarningIcon aria-hidden className={styles.warningIcon} />
              The full payout ({formatUsd(amountToPayInUsd)} USD) exceeded the remaining coverage. The remaining
              coverage was paid out
            </p>
          )}
        </div>
      );
    }

    case 'DisputeResolvedWithSettlementPayout': {
      const payout = props.payout!;
      const amountToPayInUsd = getAmountToPayInUsd(claim);

      return (
        <div className={styles.actionSection}>
          <p className={styles.arbitrator}>
            <KlerosIcon aria-hidden />
            Kleros
          </p>
          <div className={styles.actionMainInfo} data-testid="status-message">
            <span className={styles.approved}>
              <CheckIcon aria-hidden />
              Settled
            </span>
            <br />
            {formatUsd(payout.amountInUsd)} USD
            <PayoutAmount claim={claim} payout={props.payout!} />
          </div>
          <p className={styles.actionMessage}>All done! The settlement was accepted and paid out.</p>
          <ExternalLink href={getEtherscanTransactionUrl(chainId, payout.transactionHash)} className="link-primary">
            View the transaction here
          </ExternalLink>
          {payout.amountInUsd.lt(amountToPayInUsd) && (
            <p className={styles.coverageMessage}>
              <WarningIcon aria-hidden className={styles.warningIcon} />
              The full settlement ({formatUsd(amountToPayInUsd)} USD) exceeded the remaining coverage. The remaining
              coverage was paid out
            </p>
          )}
        </div>
      );
    }

    case 'DisputeResolvedWithoutPayout':
      return (
        <div className={styles.actionSection}>
          <p className={styles.arbitrator}>
            <KlerosIcon aria-hidden />
            Kleros
          </p>
          <div className={styles.actionMainInfo}>
            <span className={styles.rejected}>
              <CloseIcon aria-hidden />
              Rejected
            </span>
          </div>
        </div>
      );

    case 'None':
      return null;
  }
}

function getAmountToPayInUsd(claim: Claim) {
  switch (claim.status) {
    case 'SettlementAccepted':
    case 'DisputeResolvedWithSettlementPayout':
      return claim.settlementAmountInUsd!;
    default:
      return claim.claimAmountInUsd;
  }
}
