import { BigNumber } from 'ethers';
import { useState } from 'react';
import { ModalFooter, ModalHeader } from '../../../components/modal/modal';
import Button from '../../../components/button/button';
import { notifications } from '../../../components/notifications/notifications';
import { go, isUserRejection, messages } from '../../../utils';
import styles from './forms.module.scss';

interface Props {
  title: string;
  amount: BigNumber;
  onConfirm: (parsedInput: BigNumber) => Promise<any>;
  onClose: () => void;
  onChange: (input: string) => void;
  closeOnConfirm?: boolean;
}

const ConfirmUnstakeForm = (props: Props) => {
  const [error, setError] = useState('');
  const { amount, onConfirm, onClose, closeOnConfirm = true } = props;

  const handleAction = async () => {
    setError('');

    const [err] = await go(onConfirm(amount));
    if (err) {
      if (isUserRejection(err)) {
        notifications.info({ message: messages.TX_GENERIC_REJECTED });
        return;
      }
      setError(messages.TX_GENERIC_ERROR);
      return;
    }

    if (closeOnConfirm) {
      onClose();
    }
  };

  return (
    <>
      <ModalHeader>{props.title}</ModalHeader>

      <ModalFooter>
        <div className={styles.tokenAmountFormActions}>
          <Button type="text" onClick={onClose} className={styles.cancelButton}>
            Cancel
          </Button>
          <Button type="secondary" onClick={handleAction}>
            Initiate Unstaking
          </Button>
        </div>

        {error && <p className={styles.tokenAmountFormError}>{error}</p>}
      </ModalFooter>
    </>
  );
};

export default ConfirmUnstakeForm;
