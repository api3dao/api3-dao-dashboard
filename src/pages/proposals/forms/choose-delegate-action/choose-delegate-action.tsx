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
          <Button
            type="secondary-neutral"
            size="sm"
            sm={{ size: 'lg' }}
            onClick={onUpdateDelegation}
            disabled={!canUpdateDelegation}
          >
            Update delegation
          </Button>

          <Button type="primary" size="sm" sm={{ size: 'lg' }} onClick={onUndelegate} disabled={!canUndelegate}>
            Undelegate
          </Button>
        </div>
      </ModalFooter>
    </>
  );
};

export default ChooseDelegateAction;
