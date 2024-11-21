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

      <ModalFooter noMargin>
        <div className={styles.tokenAmountFormActions}>
          <Button type="text-blue" size="sm" sm={{ size: 'lg' }} onClick={onClose} className={styles.cancelButton}>
            Cancel
          </Button>
          <Button type="primary" size="sm" sm={{ size: 'lg' }} onClick={handleAction}>
            Yes, Initiate Unstaking
          </Button>
        </div>
        <UnstakeHelperText type="extended" />
      </ModalFooter>
    </>
  );
};

export default ConfirmUnstakeForm;
