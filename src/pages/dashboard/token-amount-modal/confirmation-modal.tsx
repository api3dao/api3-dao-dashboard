import Modal from '../../../components/modal/modal';
import Button from '../../../components/button/button';
import './confirmation-modal.scss';

interface Props {
  title: string;
  onConfirm: (value: string) => void | Promise<any>;
  onClose: (type: 'confirm' | 'all') => void;
  open: boolean;
  inputValue: string;
}

const ConfirmationModal = (props: Props) => {
  const { title, onConfirm, onClose, open, inputValue } = props;

  return (
    <Modal
      open={open}
      header={title}
      footer={
        <div className="confirmation-modal-actions">
          <Button type="link" onClick={() => onClose('confirm')}>
            Cancel
          </Button>
          <Button
            type="secondary"
            onClick={async () => {
              // TODO: maybe show loading spinner while we wait for confirmation?
              await onConfirm(inputValue);
              onClose('all');
            }}
          >
            Initiate Unstaking
          </Button>
        </div>
      }
      onClose={() => onClose('confirm')}
    />
  );
};

export default ConfirmationModal;
