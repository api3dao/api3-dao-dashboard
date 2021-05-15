import { useState } from 'react';
import Modal from '../../../components/modal/modal';
import Input from '../../../components/input/input';
import Button from '../../../components/button/button';
import ConfirmationModal from './confirmation-modal';
import './token-amount-modal.scss';

interface Props {
  title: string;
  action: string;
  onConfirm: (value: string) => void | Promise<any>;
  onClose: () => void;
  open: boolean;
  ownedTokens?: string;
}

const TokenAmountModal = (props: Props) => {
  const [inputValue, setInputValue] = useState('');
  const [openConfirmationModal, setConfirmationModal] = useState<boolean>(false);
  const { title, action, onConfirm, onClose, open, ownedTokens } = props;

  const handleConfirm = async () => {
    if (action === 'Unstake') return setConfirmationModal(true);
    await onConfirm(inputValue);
    onClose();
  };

  const handleCloseModals = (type: 'confirm' | 'all') => {
    if (type === 'all') {
      setConfirmationModal(false);
      onClose();
    } else {
      setConfirmationModal(false);
    }
  };

  return (
    <>
      <Modal
        open={open}
        header={title}
        footer={
          <Button type="secondary" onClick={handleConfirm}>
            {action}
          </Button>
        }
        onClose={onClose}
      >
        <p className="tokenAmountModal-token medium">TOKEN</p>

        <Input value={inputValue} onChange={(e) => setInputValue(e.target.value)} size="large" />
        <div className="tokenAmountModal-balance">Your balance: {ownedTokens}</div>
      </Modal>
      <ConfirmationModal
        title={`Are you sure you would like to unstake ${inputValue} tokens?`}
        open={openConfirmationModal}
        onClose={handleCloseModals}
        onConfirm={onConfirm}
        inputValue={inputValue}
      />
    </>
  );
};

export default TokenAmountModal;
