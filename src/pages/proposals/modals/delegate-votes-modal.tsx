import { useState } from 'react';
import Button from '../../../components/button/button';
import Input from '../../../components/input/input';
import GenericModal from '../../../components/modal/modal';
import { useApi3Pool } from '../../../contracts';
import './modals.scss';

interface Props {
  open: boolean;
  onClose: () => void;
}

const DelegateVotesModal = (props: Props) => {
  const { open, onClose } = props;

  const [delegationAddress, setDelegationAddress] = useState('');
  const api3Pool = useApi3Pool();

  return (
    <GenericModal
      open={open}
      onClose={onClose}
      header="Delegate my votes to:"
      footer={
        <Button
          type="secondary"
          size="large"
          onClick={async () => {
            if (!api3Pool) return null;

            // TODO: handle error
            await api3Pool.delegateVotingPower(delegationAddress);
            onClose();
          }}
        >
          Delegate votes
        </Button>
      }
    >
      <div className="text-center">
        <p className="delegate-votes-modal-subtitle secondary-color medium">ADDRESS</p>
        <Input
          type="autosize"
          placeholder="Enter address here"
          value={delegationAddress}
          onChange={(e) => setDelegationAddress(e.target.value)}
        />
      </div>
    </GenericModal>
  );
};

export default DelegateVotesModal;
