import Button from '../../../../components/button/button';
import { ModalFooter, ModalHeader } from '../../../../components/modal/modal';
import { useApi3Pool } from '../../../../contracts';
import globalStyles from '../../../../styles/global-styles.module.scss';
import styles from './undelegate.module.scss';

interface Props {
  onClose: () => void;
}

const UndelegateForm = (props: Props) => {
  const { onClose } = props;
  const api3Pool = useApi3Pool();

  return (
    <>
      <ModalHeader>Confirm undelegation</ModalHeader>

      <p className={globalStyles.textCenter}>Are you sure you want to undelegate voting power?</p>

      <ModalFooter>
        <div className={styles.actions}>
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
      </ModalFooter>
    </>
  );
};

export default UndelegateForm;
