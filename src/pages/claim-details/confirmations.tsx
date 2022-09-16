import { useEffect, useState } from 'react';
import { BigNumber } from 'ethers';
import { go } from '@api3/promise-utils';
import { ModalFooter, ModalHeader } from '../../components/modal';
import Button from '../../components/button';
import Skeleton from '../../components/skeleton';
import { notifications } from '../../components/notifications';
import { formatEther, messages } from '../../utils';
import { useArbitratorProxy } from '../../contracts';
import styles from './confirmations.module.scss';

interface EscalateConfirmationProps {
  disableActions: boolean;
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
        <div className={styles.cost}>
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
        <p className={styles.info}>API3 uses Kleros for arbitration.</p>
        <a href="https://docs.api3.org" target="_blank" rel="noopener noreferrer" className="link-primary">
          Read more to understand Kleros’s fees and the appeal process (link to docs).
        </a>
      </div>
      <ModalFooter>
        <div className={styles.buttonRow}>
          <Button variant="text" onClick={props.onCancel}>
            Cancel
          </Button>
          <Button
            variant="primary"
            size="large"
            disabled={!cost || props.disableActions}
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
  disableActions: boolean;
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
        <div className={styles.cost}>
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
          API3 uses Kleros for arbitration. The cost of an appeal increases for every appeal.
        </p>
        <a href="https://docs.api3.org" target="_blank" rel="noopener noreferrer" className="link-primary">
          Read more to understand Kleros’s fees and the appeal process (link to docs).
        </a>
      </div>
      <ModalFooter>
        <div className={styles.buttonRow}>
          <Button variant="text" onClick={props.onCancel}>
            Cancel
          </Button>
          <Button
            variant="primary"
            size="large"
            disabled={!cost || props.disableActions}
            onClick={() => props.onConfirm(cost!)}
          >
            Appeal
          </Button>
        </div>
      </ModalFooter>
    </>
  );
}
