import Button from '../../../../components/button';
import { ModalFooter, ModalHeader } from '../../../../components/modal';
import styles from './confirm-undelegate-form.module.scss';

interface Props {
  onConfirm: () => void;
  onClose: () => void;
}

export default function ConfirmUndelegateForm(props: Props) {
  const { onConfirm, onClose } = props;

  return (
    <>
      <ModalHeader>Confirm delegation action</ModalHeader>

      <ModalFooter>
        <div className={styles.actions}>
          <Button type="text-blue" size="sm" sm={{ size: 'lg' }} onClick={onClose}>
            Cancel
          </Button>

          <Button destructive type="primary" size="sm" sm={{ size: 'lg' }} onClick={onConfirm}>
            Yes, Undelegate
          </Button>
        </div>
      </ModalFooter>
    </>
  );
}
