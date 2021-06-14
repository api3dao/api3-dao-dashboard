import throttle from 'lodash/throttle';
import { toast, Slide, ToastOptions } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
// Use these static classes to style react-toastify defaults
import './react-toastify-overrides.scss';
// Use these classes to style content
import styles from './notifications.module.scss';

const THROTTLE_MS = 500;

// TODO: add styling for various components
interface CloseButtonProps {
  closeToast: () => void;
}

// TODO: this should have the same styling as the modal close button
export const CloseButton = ({ closeToast }: CloseButtonProps) => (
  <div className={styles.closeButton} onClick={() => closeToast()}>
    X
  </div>
);

interface ToastProps {
  message: string;
}

const InfoToast = ({ message }: ToastProps) => {
  return <p>{message}</p>;
};

const SuccessToast = ({ message }: ToastProps) => {
  return <p>{message}</p>;
};

const WarningToast = ({ message }: ToastProps) => {
  return <p>{message}</p>;
};

const ErrorToast = ({ message }: ToastProps) => {
  return <p>{message}</p>;
};

// https://fkhadra.github.io/react-toastify/api/toast
const BASE_OPTIONS: ToastOptions = {
  transition: Slide,
  closeButton: CloseButton,
  hideProgressBar: true,
};

// NOTE: toasts are throttled to prevent duplicate notifications being displayed.
// This can occur due to callbacks being fired multiple times in quick succession
export const info = throttle(
  (message: string, overrides?: ToastOptions) => {
    return toast.info(<InfoToast message={message} />, { ...BASE_OPTIONS, ...overrides });
  },
  THROTTLE_MS,
  { trailing: false }
);

export const success = throttle(
  (message: string, overrides?: ToastOptions) => {
    return toast.success(<SuccessToast message={message} />, { ...BASE_OPTIONS, ...overrides });
  },
  THROTTLE_MS,
  { trailing: false }
);

export const warning = throttle(
  (message: string, overrides?: ToastOptions) => {
    return toast.warning(<WarningToast message={message} />, { ...BASE_OPTIONS, ...overrides });
  },
  THROTTLE_MS,
  { trailing: false }
);

export const error = throttle(
  (message: string, overrides?: ToastOptions) => {
    return toast.error(<ErrorToast message={message} />, { ...BASE_OPTIONS, ...overrides });
  },
  THROTTLE_MS,
  { trailing: false }
);

export const close = (id: string) => toast.dismiss(id);

export const closeAll = () => toast.dismiss();

export const notifications = { info, success, warning, error, close, closeAll };
