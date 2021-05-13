import classNames from 'classnames';
import React, { useState } from 'react';
import ReactDOM from 'react-dom';
import Input from '../input/input';
import Button from '../button/button';
import './modal.scss';

interface BaseProps {
  open: boolean;
  onClose: () => void;
  hideCloseButton?: true;
}

interface GenericModalProps extends BaseProps {
  children: React.ReactNode;
  header?: React.ReactNode;
  footer?: React.ReactNode;
}

const GenericModal = (props: GenericModalProps) => {
  const { onClose, open, hideCloseButton, children, header, footer } = props;

  if (!open) return null;
  return ReactDOM.createPortal(
    <div className="modal-wrapper">
      <div className="modal-backdrop"></div>
      <div className="modal">
        <img
          className={classNames('close-button', { _hidden: hideCloseButton })}
          onClick={onClose}
          src="/close.svg"
          alt="close icon"
        />
        {header && <h5 className="modal-header">{header}</h5>}
        {children}
        {footer && <div className="modal-footer">{footer}</div>}
      </div>
    </div>,
    document.getElementById('modal')!
  );
};

interface TokenAmountModalProps extends BaseProps {
  title: string;
  action: string;
  onConfirm: (value: string) => void | Promise<any>;
}

export const TokenAmountModal = (props: TokenAmountModalProps) => {
  const [inputValue, setInputValue] = useState('');
  const { title, action, onConfirm, ...baseProps } = props;

  return (
    <GenericModal
      {...baseProps}
      header={title}
      footer={
        <Button
          type="secondary"
          onClick={async () => {
            // TODO: maybe show loading spinner while we wait for confirmation?
            await onConfirm(inputValue);
            baseProps.onClose();
          }}
        >
          {action}
        </Button>
      }
    >
      <p className="tokenAmountModal-token medium">TOKEN</p>

      <Input value={inputValue} onChange={(e) => setInputValue(e.target.value)} size="large" />
    </GenericModal>
  );
};

export default GenericModal;
