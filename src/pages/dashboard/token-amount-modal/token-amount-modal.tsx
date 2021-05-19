import { ChangeEventHandler, ReactNode, useState } from 'react';
import classNames from 'classnames';
import Modal from '../../../components/modal/modal';
import Input from '../../../components/input/input';
import Button from '../../../components/button/button';
import './token-amount-modal.scss';

interface Props {
  title: string;
  action: string;
  onConfirm: () => void | Promise<any>;
  onClose: () => void;
  open: boolean;
  onChange: ChangeEventHandler<HTMLInputElement>;
  inputValue: string;
  helperText?: ReactNode;
  showTokenInput?: boolean;
}

const TokenAmountModal = (props: Props) => {
  const [error, setError] = useState('');
  const { title, action, onConfirm, onClose, open, onChange, inputValue, helperText, showTokenInput = true } = props;

  async function handleAction() {
    // Zero is also not a valid value
    if (!inputValue) {
      setError('Please ensure you have entered a non-zero value');
      return;
    }
    setError('');
    const [err, data] = await onConfirm();
    if (err) {
      setError('Please ensure you confirm the transaction');
      return;
    }
  }

  function handleClose() {
    setError('');
    onClose();
  }

  return (
    <Modal
      open={open}
      header={title}
      footer={
        <div className={classNames({ [`tokenAmountModal-actions`]: !showTokenInput })}>
          {!showTokenInput && (
            <Button type="text" onClick={onClose}>
              Cancel
            </Button>
          )}
          <Button type="secondary" onClick={handleAction}>
            {action}
          </Button>
        </div>
      }
      onClose={handleClose}
    >
      {showTokenInput && (
        <>
          <p className="tokenAmountModal-token medium">TOKEN</p>

          <Input value={inputValue} onChange={onChange} size="large" />
          {error && <p className="error">{error}</p>}
          {helperText}
        </>
      )}
    </Modal>
  );
};

export default TokenAmountModal;
