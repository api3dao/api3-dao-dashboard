import React from 'react';
import ReactDOM from 'react-dom';
import classNames from 'classnames';
import './modal.scss';

interface ModalProps {
  children?: React.ReactNode;
  header?: React.ReactNode;
  footer?: React.ReactNode;
  open: boolean;
  onClose: () => void;
  hideCloseButton?: true;
}

const Modal = (props: ModalProps) => {
  const { onClose, open, hideCloseButton, children, header, footer } = props;

  if (!open) return null;
  return ReactDOM.createPortal(
    <div className="modal-wrapper">
      <div className="modal-body">
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
      </div>
    </div>,
    document.getElementById('modal')!
  );
};

export default Modal;
