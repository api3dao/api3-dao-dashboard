import { useState } from 'react';
import Button from '../../components/button/button';
import GenericModal from '../../components/modal/modal';
import { useApi3Pool } from '../../contracts';

interface Props {
  open: boolean;
  onClose: () => void;
}

const DelegateVotesModal = (props: Props) => {
  const { open, onClose } = props;

  const [delegationAddress, setDelegationAddress] = useState('');
  const api3Pool = useApi3Pool();

  return (
    <GenericModal open={open} onClose={onClose}>
      <h5 className="title">Delegate my votes to:</h5>
      <p>ADDRESS</p>

      {/* TODO: replace with TF from design */}
      <input type="text" value={delegationAddress} onChange={(e) => setDelegationAddress(e.target.value)} />

      <Button
        type="secondary"
        className="action-button"
        onClick={async () => {
          if (!api3Pool) return null;

          // TODO: handle error
          await api3Pool.delegateVotingPower(delegationAddress);
          onClose();
        }}
      >
        Delegate votes
      </Button>
    </GenericModal>
  );
};

export default DelegateVotesModal;
