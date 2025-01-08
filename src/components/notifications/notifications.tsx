import throttle from 'lodash/throttle';
import classNames from 'classnames';
import { toast, Slide, ToastOptions } from 'react-toastify';
import * as Sentry from '@sentry/browser';
import Button from '../button';
import styles from './notifications.module.scss';
import { ReactNode } from 'react';
import {
  CheckCircleFillIcon,
  CrossIcon,
  ExclamationTriangleFillIcon,
  ExternalLinkIcon,
  InfoCircleFillIcon,
  WarningCircleFillIcon,
} from '../icons';

import 'react-toastify/dist/ReactToastify.css';
import './react-toastify-overrides.scss';

const THROTTLE_MS = 0;

type ToastProps =
  | {
      customAction?: never;
      message: string;
      url?: string;
    }
  | {
      customAction: ReactNode;
      message: string;
      url?: never;
    };

type ErrorToastProps = {
  errorOrMessage?: Error | string;
  sendToSentry?: boolean;
} & ToastProps;

const GenericIcon = (props: { type: Partial<ToastOptions['type']> }) => {
  const icons = {
    info: <InfoCircleFillIcon className={classNames(styles.icon, styles.info)} />,
    success: <CheckCircleFillIcon className={classNames(styles.icon, styles.success)} />,
    error: <ExclamationTriangleFillIcon className={classNames(styles.icon, styles.error)} />,
    warning: <WarningCircleFillIcon className={classNames(styles.icon, styles.warning)} />,
  };

  return icons[props.type as keyof typeof icons];
};

const CustomToast = (props: ToastProps & ToastOptions) => {
  const { customAction, message, type, url } = props;

  return (
    <div className={styles.notification}>
      <GenericIcon type={type} />

      <div className={styles.notificationContent}>
        <span className={styles.notificationMessage}>{message}</span>

        {url && (
          <div className={styles.transactionButtonContainer}>
            <Button type="text-gray" size="xs" className={styles.transactionButton} href={url}>
              <span>View transaction</span>
              <ExternalLinkIcon />
            </Button>
          </div>
        )}

        {customAction}
      </div>

      <div className={styles.progressBarBackground} />
    </div>
  );
};

// https://fkhadra.github.io/react-toastify/api/toast
const BASE_OPTIONS: ToastOptions = {
  transition: Slide,
  closeButton: (props) => (
    <button className={styles.closeButton} onClick={props.closeToast}>
      <CrossIcon />
      <span className="sr-only">Close</span>
    </button>
  ),
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
    return toast.success(<CustomToast {...props} type="success" />, {
      ...BASE_OPTIONS,
      ...overrides,
    });
  },
  THROTTLE_MS,
  { trailing: false }
);

export const warning = throttle(
  (props: ToastProps, overrides?: ToastOptions) => {
    return toast.warning(<CustomToast {...props} type="warning" />, {
      ...BASE_OPTIONS,
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

    return toast.error(<CustomToast {...other} type="error" />, { ...BASE_OPTIONS, ...overrides });
  },
  THROTTLE_MS,
  { trailing: false }
);

export const close = (id: React.ReactText) => toast.dismiss(id);

export const closeAll = () => toast.dismiss();

export const notifications = { info, success, warning, error, close, closeAll };
