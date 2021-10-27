import { BigNumber } from 'ethers';
import { ModalFooter, ModalHeader } from '../../../components/modal';
import Button from '../../../components/button';
import styles from './forms.module.scss';
import UnstakeHelperText from './unstake-helper-text';

interface Props {
  title: string;
  amount: BigNumber;
  onConfirm: (parsedInput: BigNumber) => Promise<any>;
  onClose: () => void;
}

const ConfirmUnstakeForm = (props: Props) => {
  const { amount, onConfirm, onClose } = props;

  const handleAction = async () => {
    onConfirm(amount);
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
        <UnstakeHelperText type="extended" />
      </ModalFooter>
    </>
  );
};

export default ConfirmUnstakeForm;
