import { BigNumber } from 'ethers';
import { useState } from 'react';
import { ModalFooter, ModalHeader } from '../../../components/modal/modal';
import Button from '../../../components/button/button';
import styles from './forms.module.scss';
import { handleTransactionError } from '../../../utils';

interface Props {
  title: string;
  amount: BigNumber;
  onConfirm: (parsedInput: BigNumber) => Promise<any>;
  onClose: () => void;
  closeOnConfirm?: boolean;
}

const ConfirmUnstakeForm = (props: Props) => {
  const [error, setError] = useState('');
  const { amount, onConfirm, onClose, closeOnConfirm = true } = props;

  const handleAction = async () => {
    setError('');

    await handleTransactionError(onConfirm(amount));
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
