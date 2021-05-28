import React from 'react';
import ReactDOM from 'react-dom';
import classNames from 'classnames';
import { useOnAccountOrNetworkChange } from '../../contracts';
import './modal.scss';

interface ModalProps {
  children?: React.ReactNode;
  open: boolean;
  onClose: () => void;
  hideCloseButton?: true;
  size?: 'small' | 'medium' | 'large';
}

export const Modal = (props: ModalProps) => {
  const { onClose, open, hideCloseButton, children, size = 'medium' } = props;

  // It's possible for the user to have a "permissioned" modal open while on one account,
  // then switch to another account that does not have the same permissions. As a blanket
  // fix, close any open modals when the selected account changes.
  useOnAccountOrNetworkChange(() => {
    if (open) onClose();
  });

  if (!open) return null;

  return ReactDOM.createPortal(
    <div className="modal-wrapper">
      <div
        className={classNames('modal-body', {
          _small: size === 'small',
          _medium: size === 'medium',
          _large: size === 'large',
        })}
      >
        <div className="modal">
          <img
            className={classNames('close-button', { _hidden: hideCloseButton })}
            onClick={onClose}
            src="/close.svg"
            alt="close icon"
          />
          {children}
        </div>
      </div>
    </div>,
    document.getElementById('modal')!
  );
};

interface ModalHeaderProps {
  children?: React.ReactNode;
}

export const ModalHeader = (props: ModalHeaderProps) => {
  if (props.children) return null;
  return <h5 className="modal-header text-center">{props.children}</h5>;
};

interface ModalFooterProps {
  children?: React.ReactNode;
}

export const ModalFooter = (props: ModalFooterProps) => {
  if (props.children) return null;
  return <div className="modal-footer">{props.children}</div>;
};
