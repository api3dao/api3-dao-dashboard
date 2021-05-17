import { ChangeEventHandler } from 'react';
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
  helperText?: string;
  showTokenInput?: boolean;
}

const HelperText = (props: { helperText: string }) => {
  const { helperText } = props;
  return <div className="depositModal-balance">Your balance: {helperText}</div>;
};

const TokenAmountModal = (props: Props) => {
  const { title, action, onConfirm, onClose, open, onChange, inputValue, helperText, showTokenInput = true } = props;

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
          <Button type="secondary" onClick={onConfirm}>
            {action}
          </Button>
        </div>
      }
      onClose={onClose}
    >
      {showTokenInput && (
        <>
          <p className="tokenAmountModal-token medium">TOKEN</p>

          <Input value={inputValue} onChange={onChange} size="large" />
          {helperText && <HelperText helperText={helperText} />}
        </>
      )}
    </Modal>
  );
};

export default TokenAmountModal;
