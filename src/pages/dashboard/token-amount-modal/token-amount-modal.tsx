import { ChangeEventHandler, ReactNode } from 'react';
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
  const { title, action, onConfirm, onClose, open, onChange, inputValue, helperText, showTokenInput = true } = props;

  return (
    <Modal
      open={open}
      header={title}
      footer={
        <div className={classNames({ [`tokenAmountModal-actions`]: !showTokenInput })}>
          {!showTokenInput && (
            <Button type="text" size="large" onClick={onClose}>
              Cancel
            </Button>
          )}
          <Button type="secondary" size="large" onClick={onConfirm}>
            {action}
          </Button>
        </div>
      }
      onClose={onClose}
    >
      {showTokenInput && (
        <div className="text-center">
          <p className="tokenAmountModal-token medium">TOKEN</p>

          <Input type="number" value={inputValue} onChange={onChange} size="large" />
          {helperText}
        </div>
      )}
    </Modal>
  );
};

export default TokenAmountModal;
