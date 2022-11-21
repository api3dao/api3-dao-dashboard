import FocusLock from 'react-focus-lock';
import React, { useEffect } from 'react';
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

export const ModalContent = (props: ModalProps) => {
  const { onClose, hideCloseButton = false, children, size = 'medium' } = props;

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      // https://developer.mozilla.org/en-US/docs/Web/API/KeyboardEvent/key#example
      if (e.key === 'Esc' || e.key === 'Escape') {
        onClose();
      }
    };

    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [onClose]);

  return (
    <FocusLock>
      <div className={styles.modalWrapper} role="dialog">
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
              tabIndex={0}
              onKeyPress={triggerOnEnter(onClose)}
            />
            {children}
          </div>
        </div>
      </div>
    </FocusLock>
  );
};

export const Modal = (props: ModalProps) => {
  const { open, closeOnAccountChange, onClose } = props;

  // It's possible for the user to have a "permissioned" modal open while on one account,
  // then switch to another account that does not have the same permissions. As a blanket
  // fix, close any open modals when the selected account changes.
  useOnAccountOrNetworkChange(() => {
    if (open && closeOnAccountChange) onClose();
  });

  if (!open) return null;
  return ReactDOM.createPortal(<ModalContent {...props} />, document.getElementById('modal')!);
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

export const triggerOnEnter =
  (callback: (e: React.KeyboardEvent<HTMLElement>) => void) => (e: React.KeyboardEvent<HTMLElement>) => {
    if (e.key === 'Enter') {
      callback(e);
    }
  };
