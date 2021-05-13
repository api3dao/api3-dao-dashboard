import classNames from 'classnames';
import React, { useState } from 'react';
import ReactDOM from 'react-dom';
import Button from '../button/button';
import './modal.scss';

interface BaseProps {
  open: boolean;
  onClose: () => void;
  hideCloseButton?: true;
}

interface GenericModalProps extends BaseProps {
  children: React.ReactNode;
}

const CloseButton = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M2 2L21.8 21.8" stroke="#F3F3F3" strokeWidth="1.5" />
    <path d="M2 21.8L21.8 2" stroke="#F3F3F3" strokeWidth="1.5" />
  </svg>
);

const GenericModal = (props: GenericModalProps) => {
  const { onClose, open, hideCloseButton, children } = props;

  if (!open) return null;
  return ReactDOM.createPortal(
    <div className="modal">
      <div className="modal backdrop"></div>
      <div className="modal content">
        <div onClick={onClose} className={classNames('close-button', hideCloseButton && 'hidden')}>
          <CloseButton />
        </div>

        {children}
      </div>
    </div>,
    document.getElementById('modal')!
  );
};

interface TokenAmountModalProps extends BaseProps {
  title: string;
  action: string;
  onConfirm: (value: string) => void;
}

export const TokenAmountModal = (props: TokenAmountModalProps) => {
  const [inputValue, setInputValue] = useState('');
  const { title, action, onConfirm, ...baseProps } = props;

  return (
    <GenericModal {...baseProps}>
      <h5 className="title">{title}</h5>
      <p>TOKEN</p>

      {/* TODO: replace with TF from design */}
      {/* TODO: validation + maybe use something like React number format */}
      <input type="text" value={inputValue} onChange={(e) => setInputValue(e.target.value)} />

      <Button
        type="secondary"
        className="action-button"
        onClick={() => {
          onConfirm(inputValue);
          baseProps.onClose();
        }}
      >
        {action}
      </Button>
    </GenericModal>
  );
};

export default GenericModal;
