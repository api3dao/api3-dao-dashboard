import { toast, Slide, ToastOptions } from 'react-toastify';
import styles from './notifications.module.scss';
import 'react-toastify/dist/ReactToastify.css';

const BASE_OPTIONS: ToastOptions = {
  transition: Slide,
  hideProgressBar: true,
};

export const useNotifications = () => {
  const info = (message: string, overrides?: ToastOptions) =>
    toast.info(<Info message={message} />, { ...BASE_OPTIONS, ...overrides });
  const success = (message: string, overrides?: ToastOptions) =>
    toast.success(message, { ...BASE_OPTIONS, ...overrides });
  const warning = (message: string, overrides?: ToastOptions) =>
    toast.warning(message, { ...BASE_OPTIONS, ...overrides });
  const error = (message: string, overrides?: ToastOptions) => toast.error(message, { ...BASE_OPTIONS, ...overrides });

  const close = (id: string) => toast.dismiss(id);
  const closeAll = () => toast.dismiss();

  return { info, success, warning, error, close, closeAll };
};

interface CloseButtonProps {
  closeToast: () => void;
}

export const CloseButton = ({ closeToast }: CloseButtonProps) => (
  <i className={styles.closeButton} onClick={() => closeToast()}>
    X
  </i>
);

interface ToastProps {
  message: string;
}

const Info = ({ message }: ToastProps) => {
  return <p style={{ fontSize: 12 }}>{message}</p>;
};
