import { useState } from 'react';
import Button from '../../../components/button/button';
import Input from '../../../components/input/input';
import { ModalFooter, ModalHeader } from '../../../components/modal/modal';
import { useApi3Pool } from '../../../contracts';
import globalStyles from '../../../styles/global-styles.module.scss';
import styles from './forms.module.scss';

interface Props {
  onClose: () => void;
}

const DelegateVotesForm = (props: Props) => {
  const { onClose } = props;

  const [delegationAddress, setDelegationAddress] = useState('');
  const api3Pool = useApi3Pool();

  return (
    <>
      <ModalHeader>Delegate my votes to:</ModalHeader>

      <div className={globalStyles.textCenter}>
        <p className={styles.delegateVotesModalSubtitle}>ADDRESS</p>
        <Input
          type="autosize-text"
          placeholder="Enter address here"
          value={delegationAddress}
          onChange={(e) => setDelegationAddress(e.target.value)}
        />
      </div>

      <ModalFooter>
        <Button
          type="secondary"
          size="large"
          onClick={async () => {
            if (!api3Pool) return;

            // TODO: handle error
            await api3Pool.delegateVotingPower(delegationAddress);
            onClose();
          }}
        >
          Delegate Tokens
        </Button>
      </ModalFooter>
    </>
  );
};

export default DelegateVotesForm;
