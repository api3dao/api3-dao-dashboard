import throttle from 'lodash/throttle';
import classNames from 'classnames';
import { toast, Slide, ToastOptions } from 'react-toastify';
import NotificationLinkButton from './notification-link-button';
import { images } from '../../utils';
import 'react-toastify/dist/ReactToastify.css';
// Use these static classes to style react-toastify defaults
import './react-toastify-overrides.scss';
// Use these classes to style content
import styles from './notifications.module.scss';
import * as Sentry from '@sentry/browser';

const THROTTLE_MS = 500;

interface CloseButtonProps {
  closeToast: () => void;
}

export const CloseButton = ({ closeToast }: CloseButtonProps) => (
  <div className={styles.closeButton} onClick={() => closeToast()}>
    <img src={images.notificationClose} alt="notification close button" />
  </div>
);

interface ToastProps {
  message: string;
  url?: string;
}

interface ErrorToastProps extends ToastProps {
  errorOrMessage: Error | string;
  sendToSentry?: boolean;
}

interface ToastPropsWithType extends ToastProps {
  type: 'info' | 'success' | 'warning' | 'error';
}

const CustomToast = ({ message, type, url }: ToastPropsWithType) => {
  return (
    <div className={classNames(styles.notificationBody, { [styles.url]: url })}>
      <img src={`/${type}.svg`} alt={`${type} icon`} />
      <div className={styles.notificationContent}>
        <p>{message}</p>
        {url && (
          <div className={styles.notificationUrl}>
            <NotificationLinkButton href={url}>View transaction</NotificationLinkButton>
          </div>
        )}
      </div>
    </div>
  );
};

// https://fkhadra.github.io/react-toastify/api/toast
const BASE_OPTIONS: ToastOptions = {
  transition: Slide,
  closeButton: CloseButton,
  hideProgressBar: false,
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
  (props: ErrorToastProps, overrides?: ToastOptions) => {
    const { sendToSentry = false, errorOrMessage, ...other } = props;
    if (sendToSentry) {
      if (typeof errorOrMessage === 'string') Sentry.captureMessage(errorOrMessage);
      else Sentry.captureException(errorOrMessage);
    }

    if (process.env.NODE_ENV === 'development') {
      // Prefixing the error message with ad-hoc string for better backwards search
      console.error('[DEV: Caught error]:', errorOrMessage);
    }

    return toast.info(<CustomToast {...other} type="error" />, { ...BASE_OPTIONS, ...overrides });
  },
  THROTTLE_MS,
  { trailing: false }
);

export const close = (id: React.ReactText) => toast.dismiss(id);

export const closeAll = () => toast.dismiss();

export const notifications = { info, success, warning, error, close, closeAll };
