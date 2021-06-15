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
  url?: string;
}

interface ToastPropsWithType extends ToastProps {
  type: 'info' | 'success' | 'warning' | 'error';
}

const CustomToast = ({ message, type, url }: ToastPropsWithType) => {
  // TODO: style based on the type of toast
  return (
    <>
      <div>
        <p>{message}</p>
      </div>
      {url && (
        <a href={url} target="_blank" rel="noopener noreferrer">
          {url}
        </a>
      )}
    </>
  );
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
  (props: ToastProps, overrides?: ToastOptions) => {
    return toast.info(<CustomToast {...props} type="info" />, { ...BASE_OPTIONS, ...overrides });
  },
  THROTTLE_MS,
  { trailing: false }
);

export const success = throttle(
  (props: ToastProps, overrides?: ToastOptions) => {
    return toast.info(<CustomToast {...props} type="success" />, { ...BASE_OPTIONS, ...overrides });
  },
  THROTTLE_MS,
  { trailing: false }
);

export const warning = throttle(
  (props: ToastProps, overrides?: ToastOptions) => {
    return toast.info(<CustomToast {...props} type="warning" />, { ...BASE_OPTIONS, ...overrides });
  },
  THROTTLE_MS,
  { trailing: false }
);

export const error = throttle(
  (props: ToastProps, overrides?: ToastOptions) => {
    return toast.info(<CustomToast {...props} type="error" />, { ...BASE_OPTIONS, ...overrides });
  },
  THROTTLE_MS,
  { trailing: false }
);

export const close = (id: React.ReactText) => toast.dismiss(id);

export const closeAll = () => toast.dismiss();

export const notifications = { info, success, warning, error, close, closeAll };
