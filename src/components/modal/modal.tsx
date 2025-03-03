import FocusLock from 'react-focus-lock';
import React, { useEffect } from 'react';
import ReactDOM from 'react-dom';
import classNames from 'classnames';
import { useOnAccountOrNetworkChange } from '../../contracts';
import styles from './modal.module.scss';
import { CloseIcon } from '../icons';

type ModalSize = 'normal' | 'large';

interface ModalProps {
  children?: React.ReactNode;
  size?: ModalSize;
  open: boolean;
  onClose: () => void;
  hideCloseButton?: true;
  closeOnAccountChange?: false;
}

export const ModalContent = (props: ModalProps) => {
  const { onClose, hideCloseButton = false, children, size = 'normal' } = props;

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
      <div id="modal-wrapper" className={styles.modalWrapper}>
        <div
          className={classNames(styles.modal, {
            [styles.modalNormal]: size === 'normal',
            [styles.modalLarge]: size === 'large',
          })}
        >
          {!hideCloseButton && (
            <div className={styles.closeButtonWrapper}>
              <button onClick={onClose} onKeyDown={triggerOnEnter(onClose)} data-testid="modal-close-button">
                <CloseIcon />
                <span className="sr-only">Close modal</span>
              </button>
            </div>
          )}

          <div
            className={classNames(styles.modalContent, {
              [styles.modalContentNormal]: size === 'normal',
              [styles.modalContentLarge]: size === 'large',
            })}
          >
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
  children: string;
  size?: ModalSize;
  noMargin?: boolean;
}

export const ModalHeader = ({ children, size, noMargin = false }: ModalHeaderProps) => {
  if (size === 'large') {
    return (
      <div className={classNames(styles.modalHeader, styles.modalHeaderLarge, { [styles.noMargin]: noMargin })}>
        <h5>{children}</h5>
      </div>
    );
  }

  return (
    <div className={classNames(styles.modalHeader, styles.modalHeaderNormal, { [styles.noMargin]: noMargin })}>
      <h5>{children}</h5>
    </div>
  );
};

interface ModalFooterProps {
  children?: React.ReactNode;
  noMargin?: boolean;
}

export const ModalFooter = ({ children, noMargin }: ModalFooterProps) => {
  if (!children) return null;
  return <div className={classNames(styles.modalFooter, { [styles.noMargin]: noMargin })}> {children}</div>;
};

export const triggerOnEnter =
  (callback: (e: React.KeyboardEvent<HTMLElement>) => void) => (e: React.KeyboardEvent<HTMLElement>) => {
    if (e.key === 'Enter') {
      callback(e);
    }
  };
