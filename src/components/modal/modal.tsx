import React, { useEffect } from 'react';
import ReactDOM from 'react-dom';
import classNames from 'classnames';
import { useChainData } from '../../chain-data';
import { usePrevious } from '../../utils';
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
  const { userAccount } = useChainData();
  const prevUserAccount = usePrevious(userAccount);

  useEffect(() => {
    if (!open || !prevUserAccount || !userAccount) return;
    // It's possible for the user to have a "permissioned" modal open while on one account,
    // then switch to another account that does not have the same permissions. As a blanket
    // fix, close any open modals when the selected account changes.
    if (prevUserAccount !== userAccount) {
      onClose();
    }
  }, [open, prevUserAccount, userAccount, onClose]);

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
