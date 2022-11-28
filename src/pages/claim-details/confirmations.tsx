import { useEffect, useState } from 'react';
import { BigNumber } from 'ethers';
import { go } from '@api3/promise-utils';
import { ModalFooter, ModalHeader } from '../../components/modal';
import Button from '../../components/button';
import ExternalLink from '../../components/external-link';
import Skeleton from '../../components/skeleton';
import { notifications } from '../../components/notifications';
import { formatEther, messages } from '../../utils';
import { useArbitratorProxy } from '../../contracts';
import globalStyles from '../../styles/global-styles.module.scss';
import styles from './confirmations.module.scss';

interface EscalateConfirmationProps {
  disableAction: boolean;
  onConfirm: (cost: BigNumber) => void;
  onCancel: () => void;
}

export function EscalateConfirmation(props: EscalateConfirmationProps) {
  const arbitratorProxy = useArbitratorProxy()!;

  const [cost, setCost] = useState<BigNumber | null>(null);
  const [status, setStatus] = useState<'idle' | 'loading' | 'loaded' | 'failed'>('idle');

  useEffect(() => {
    const load = async () => {
      setStatus('loading');
      const result = await go(() => arbitratorProxy.arbitrationCost());
      if (result.success) {
        setCost(result.data);
        setStatus('loaded');
      } else {
        setStatus('failed');
        notifications.error({ message: messages.FAILED_TO_LOAD_ESCALATION_COST, errorOrMessage: result.error });
      }
    };

    load();
  }, [arbitratorProxy]);

  return (
    <>
      <ModalHeader>Escalation Cost</ModalHeader>
      <div className={styles.body}>
        <div className={styles.cost} data-testid="cost">
          {cost ? (
            <>{formatEther(cost)} ETH</>
          ) : status === 'failed' ? (
            '-'
          ) : (
            <Skeleton width="7.5ch">
              <span className="sr-only">Loading...</span>
            </Skeleton>
          )}
        </div>
        <p className={styles.info}>
          <ExternalLink href="https://kleros.io" className="link-primary">
            Kleros (link to home)
          </ExternalLink>{' '}
          is used for arbitration.
        </p>
        <ExternalLink href="https://docs.api3.org" className="link-primary">
          Read more to understand Kleros’s fees and the appeal process (link to docs).
        </ExternalLink>
      </div>
      <ModalFooter>
        <div className={styles.buttonRow}>
          <Button variant="text" onClick={props.onCancel}>
            Cancel
          </Button>
          <Button
            variant="primary"
            size="large"
            disabled={!cost || props.disableAction}
            onClick={() => props.onConfirm(cost!)}
          >
            Escalate
          </Button>
        </div>
      </ModalFooter>
    </>
  );
}

interface AppealConfirmationProps {
  disputeId: string;
  disableAction: boolean;
  onConfirm: (cost: BigNumber) => void;
  onCancel: () => void;
}

export function AppealConfirmation(props: AppealConfirmationProps) {
  const arbitratorProxy = useArbitratorProxy()!;

  const [cost, setCost] = useState<BigNumber | null>(null);
  const [status, setStatus] = useState<'idle' | 'loading' | 'loaded' | 'failed'>('idle');

  useEffect(() => {
    const load = async () => {
      setStatus('loading');
      const result = await go(() => arbitratorProxy.appealCost(props.disputeId));
      if (result.success) {
        setCost(result.data);
        setStatus('loaded');
      } else {
        setStatus('failed');
        notifications.error({ message: messages.FAILED_TO_LOAD_APPEAL_COST, errorOrMessage: result.error });
      }
    };

    load();
  }, [arbitratorProxy, props.disputeId]);

  return (
    <>
      <ModalHeader>Appeal Cost</ModalHeader>
      <div className={styles.body}>
        <div className={styles.cost} data-testid="cost">
          {cost ? (
            <>{formatEther(cost)} ETH</>
          ) : status === 'failed' ? (
            '-'
          ) : (
            <Skeleton width="7.5ch">
              <span className="sr-only">Loading...</span>
            </Skeleton>
          )}
        </div>
        <p className={styles.info}>
          <ExternalLink href="https://kleros.io" className="link-primary">
            Kleros (link to home)
          </ExternalLink>{' '}
          is used for arbitration. The cost of an appeal increases for every appeal.
        </p>
        <ExternalLink href="https://docs.api3.org" className="link-primary">
          Read more to understand Kleros’s fees and the appeal process (link to docs).
        </ExternalLink>
      </div>
      <ModalFooter>
        <div className={styles.buttonRow}>
          <Button variant="text" onClick={props.onCancel}>
            Cancel
          </Button>
          <Button
            variant="primary"
            size="large"
            disabled={!cost || props.disableAction}
            onClick={() => props.onConfirm(cost!)}
          >
            Appeal
          </Button>
        </div>
      </ModalFooter>
    </>
  );
}

interface SettlementConfirmationProps {
  disableAction: boolean;
  onConfirm: () => void;
  onCancel: () => void;
}

export function SettlementConfirmation(props: SettlementConfirmationProps) {
  return (
    <>
      <ModalHeader>You will be paid in API3 tokens</ModalHeader>
      <div className={styles.body}>
        <p className={styles.info}>
          The USD amount will be converted into API3 tokens and transferred from the API3 staking pool to the claimant’s
          address when you accept the settlement.{' '}
          <span className={globalStyles.primaryColor}>The process is permissionless and automatic.</span>
        </p>
      </div>
      <ModalFooter>
        <div className={styles.buttonRow}>
          <Button variant="text" onClick={props.onCancel}>
            Cancel
          </Button>
          <Button variant="primary" size="large" disabled={props.disableAction} onClick={props.onConfirm}>
            Accept Settlement
          </Button>
        </div>
      </ModalFooter>
    </>
  );
}

interface PayoutConfirmationProps {
  disableAction: boolean;
  onConfirm: () => void;
  onCancel: () => void;
}

export function PayoutConfirmation(props: PayoutConfirmationProps) {
  return (
    <>
      <ModalHeader>You will be paid in API3 tokens</ModalHeader>
      <div className={styles.body}>
        <p className={styles.info}>
          The USD amount will be converted into API3 tokens and transferred from the API3 staking pool to the claimant’s
          address when you execute the payout.{' '}
          <span className={globalStyles.primaryColor}>The process is permissionless and automatic.</span>
        </p>
      </div>
      <ModalFooter>
        <div className={styles.buttonRow}>
          <Button variant="text" onClick={props.onCancel}>
            Cancel
          </Button>
          <Button variant="primary" size="large" disabled={props.disableAction} onClick={props.onConfirm}>
            Execute Payout
          </Button>
        </div>
      </ModalFooter>
    </>
  );
}
