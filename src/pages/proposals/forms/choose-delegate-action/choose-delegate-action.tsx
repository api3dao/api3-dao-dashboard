import Button from '../../../../components/button';
import { ModalFooter, ModalHeader } from '../../../../components/modal';
import styles from './choose-delegate-action.module.scss';

interface Props {
  onUpdateDelegation: () => void;
  onUndelegate: () => void;
  canUpdateDelegation: boolean;
  canUndelegate: boolean;
}

const ChooseDelegateAction = (props: Props) => {
  const { onUpdateDelegation, onUndelegate, canUpdateDelegation, canUndelegate } = props;

  return (
    <>
      <ModalHeader>Choose delegation action</ModalHeader>

      <ModalFooter>
        <div className={styles.actions}>
          <Button variant="secondary" onClick={onUpdateDelegation} disabled={!canUpdateDelegation}>
            Update delegation
          </Button>

          <Button variant="secondary" onClick={onUndelegate} disabled={!canUndelegate}>
            Undelegate
          </Button>
        </div>
      </ModalFooter>
    </>
  );
};

export default ChooseDelegateAction;
