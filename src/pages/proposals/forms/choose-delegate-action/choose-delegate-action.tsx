import { useState } from 'react';
import Button from '../../../../components/button';
import { ModalFooter, ModalHeader } from '../../../../components/modal';
import styles from './choose-delegate-action.module.scss';
import { ExclamationTriangleFillIcon } from '../../../../components/icons';

interface Props {
  onUpdateDelegation: () => void;
  onUndelegate: () => void;
  canUpdateDelegation: boolean;
  canUndelegate: boolean;
}

const ChooseDelegateAction = (props: Props) => {
  const { onUpdateDelegation, onUndelegate, canUpdateDelegation, canUndelegate } = props;

  const [confirmationStep, setConfirmationStep] = useState(false);

  if (confirmationStep) {
    return (
      <>
        <ModalHeader>Confirm delegation action</ModalHeader>

        <ModalFooter>
          <div className={styles.actions}>
            <Button type="text-blue" size="sm" sm={{ size: 'lg' }} onClick={() => setConfirmationStep(false)}>
              Cancel
            </Button>

            <Button destructive type="primary" size="sm" sm={{ size: 'lg' }} onClick={onUndelegate}>
              Yes, Undelegate
            </Button>
          </div>

          <div className={styles.confirmationText}>
            <ExclamationTriangleFillIcon />
            Once altered, your delegation cannot be changed again for 7 days.
          </div>
        </ModalFooter>
      </>
    );
  }

  return (
    <>
      <ModalHeader>Choose delegation action</ModalHeader>

      <ModalFooter>
        <div className={styles.actions}>
          <Button
            type="secondary-neutral"
            size="sm"
            sm={{ size: 'lg' }}
            onClick={onUpdateDelegation}
            disabled={!canUpdateDelegation}
          >
            Update delegation
          </Button>

          <Button
            type="primary"
            size="sm"
            sm={{ size: 'lg' }}
            onClick={() => setConfirmationStep(true)}
            disabled={!canUndelegate}
          >
            Undelegate
          </Button>
        </div>
      </ModalFooter>
    </>
  );
};

export default ChooseDelegateAction;
