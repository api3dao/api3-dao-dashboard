import React from 'react';
import ReactDOM from 'react-dom';
import classNames from 'classnames';
import { useOnAccountOrNetworkChange } from '../../contracts';
import { images } from '../../utils';
import styles from './modal.module.scss';

interface ModalProps {
  children?: React.ReactNode;
  open: boolean;
  onClose: () => void;
  hideCloseButton?: true;
  size?: 'small' | 'medium' | 'large';
  closeOnAccountChange?: false;
}

export const Modal = (props: ModalProps) => {
  const { onClose, open, hideCloseButton = false, children, size = 'medium', closeOnAccountChange = true } = props;

  // It's possible for the user to have a "permissioned" modal open while on one account,
  // then switch to another account that does not have the same permissions. As a blanket
  // fix, close any open modals when the selected account changes.
  useOnAccountOrNetworkChange(() => {
    if (open && closeOnAccountChange) onClose();
  });

  if (!open) return null;

  return ReactDOM.createPortal(
    <div className={styles.modalWrapper}>
      <div
        className={classNames(styles.modalBody, {
          [styles.small]: size === 'small',
          [styles.medium]: size === 'medium',
          [styles.large]: size === 'large',
        })}
      >
        <div className={styles.modal}>
          <img
            className={classNames(styles.closeButton, { [styles.hidden]: hideCloseButton })}
            onClick={onClose}
            src={images.close}
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
  if (!props.children) return null;
  return <h5 className={styles.modalHeader}>{props.children}</h5>;
};

interface ModalFooterProps {
  children?: React.ReactNode;
}

export const ModalFooter = (props: ModalFooterProps) => {
  if (!props.children) return null;
  return <div className={styles.modalFooter}>{props.children}</div>;
};
