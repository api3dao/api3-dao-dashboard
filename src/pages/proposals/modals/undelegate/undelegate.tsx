import Button from '../../../../components/button/button';
import Modal from '../../../../components/modal/modal';
import { useApi3Pool } from '../../../../contracts';
import './undelegate.scss';

interface Props {
  open: boolean;
  onClose: () => void;
}

const UndelegateModal = (props: Props) => {
  const { open, onClose } = props;
  const api3Pool = useApi3Pool();

  return (
    <Modal
      open={open}
      onClose={onClose}
      header="Confirm undelegation"
      footer={
        <div className="undelegate actions">
          <Button type="secondary" size="large" onClick={onClose}>
            No
          </Button>

          <Button
            size="large"
            type="secondary"
            onClick={async () => {
              if (!api3Pool) return;

              // TODO: handle error
              await api3Pool.undelegateVotingPower();
              onClose();
            }}
          >
            Yes
          </Button>
        </div>
      }
    >
      <p className="undelegate body">Are you sure you want to undelegate voting power?</p>
    </Modal>
  );
};

export default UndelegateModal;
