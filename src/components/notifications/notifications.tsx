import { toast, Slide, ToastOptions } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
// Use these static classes to style react-toastify defaults
import './react-toastify-overrides.scss';
// Use these classes to style content
import styles from './notifications.module.scss';

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

const InfoToast = ({ message, url }: ToastProps) => {
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

const SuccessToast = ({ message, url }: ToastProps) => {
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

const WarningToast = ({ message, url }: ToastProps) => {
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

const ErrorToast = ({ message, url }: ToastProps) => {
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

export const info = (props: ToastProps, overrides?: ToastOptions) => {
  return toast.info(<InfoToast {...props} />, { ...BASE_OPTIONS, ...overrides });
};

export const success = (props: ToastProps, overrides?: ToastOptions) => {
  return toast.success(<SuccessToast {...props} />, { ...BASE_OPTIONS, ...overrides });
};

export const warning = (props: ToastProps, overrides?: ToastOptions) => {
  return toast.warning(<WarningToast {...props} />, { ...BASE_OPTIONS, ...overrides });
};

export const error = (props: ToastProps, overrides?: ToastOptions) => {
  return toast.error(<ErrorToast {...props} />, { ...BASE_OPTIONS, ...overrides });
};

export const close = (id: React.ReactText) => toast.dismiss(id);

export const closeAll = () => toast.dismiss();

export const notifications = { info, success, warning, error, close, closeAll };

