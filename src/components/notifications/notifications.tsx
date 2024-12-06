import { ReactNode } from 'react';
import throttle from 'lodash/throttle';
import classNames from 'classnames';
import { toast, Slide, ToastOptions } from 'react-toastify';
import NotificationLinkButton from './notification-link-button';
import 'react-toastify/dist/ReactToastify.css';
// Use these static classes to style react-toastify defaults
import './react-toastify-overrides.scss';
// Use these classes to style content
import styles from './notifications.module.scss';
import * as Sentry from '@sentry/browser';
import {
  CheckCircleFillIcon,
  CrossIcon,
  ErrorCircleFillIcon,
  InfoCircleFillIcon,
  WarningCircleFillIcon,
} from '../icons';

// const THROTTLE_MS = 500;
const THROTTLE_MS = 0; // Just for testing

interface CloseButtonProps {
  closeToast: () => void;
}

export const CloseButton = ({ closeToast }: CloseButtonProps) => (
  <div className={styles.closeButton} onClick={() => closeToast()}>
    <CrossIcon />
  </div>
);

interface ToastProps {
  message: ReactNode;
  url?: string;
}

interface ErrorToastProps extends ToastProps {
  errorOrMessage?: Error | string;
  sendToSentry?: boolean;
}

interface ToastPropsWithType extends ToastProps {
  type: 'info' | 'success' | 'warning' | 'error';
}

const ToastIcon = ({ type }: { type: 'info' | 'success' | 'warning' | 'error' }) => {
  switch (type) {
    case 'success':
      return <CheckCircleFillIcon className={classNames(styles.icon, styles[type])} />;
    case 'error':
      return <ErrorCircleFillIcon className={classNames(styles.icon, styles[type])} />;
    case 'warning':
      return <WarningCircleFillIcon className={classNames(styles.icon, styles[type])} />;
    case 'info':
      return <InfoCircleFillIcon className={classNames(styles.icon, styles[type])} />;
  }
};

const CustomToast = ({ message, type, url }: ToastPropsWithType) => {
  return (
    <div className={classNames(styles.notificationBody, { [styles.url]: url })}>
      <ToastIcon type={type} />
      <div className={styles.notificationContent}>
        <div>{message}</div>
        {url && (
          <div className={styles.notificationUrl}>
            <NotificationLinkButton href={url}>View transaction</NotificationLinkButton>
          </div>
        )}
      </div>
      <div className={classNames(styles.progressBarBackground, styles[type])}></div>
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
    return toast.info(<CustomToast {...props} type="info" />, { ...BASE_OPTIONS, className: 'info', ...overrides });
  },
  THROTTLE_MS,
  { trailing: false }
);

export const success = throttle(
  (props: ToastProps, overrides?: ToastOptions) => {
    return toast.info(<CustomToast {...props} type="success" />, {
      ...BASE_OPTIONS,
      className: 'success',
      ...overrides,
    });
  },
  THROTTLE_MS,
  { trailing: false }
);

export const warning = throttle(
  (props: ToastProps, overrides?: ToastOptions) => {
    return toast.info(<CustomToast {...props} type="warning" />, {
      ...BASE_OPTIONS,
      className: 'warning',
      ...overrides,
    });
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
      // eslint-disable-next-line no-console
      console.error('[DEV: Caught error]:', errorOrMessage);
    }

    return toast.info(<CustomToast {...other} type="error" />, { ...BASE_OPTIONS, className: 'error', ...overrides });
  },
  THROTTLE_MS,
  { trailing: false }
);

export const close = (id: React.ReactText) => toast.dismiss(id);

export const closeAll = () => toast.dismiss();

export const notifications = { info, success, warning, error, close, closeAll };
