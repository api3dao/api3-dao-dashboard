import * as Sentry from '@sentry/react';
import { ToastContainer } from 'react-toastify';
import { useTransactionNotifications } from '../contracts';

interface Props {
  children: JSX.Element;
}

// NOTE: this must have access to the global state context
const PageContainer = (props: Props) => {
  // Whenever a new transaction is added to the state, display notifications for it
  useTransactionNotifications();

  // TODO: Implement a nicely designed error page/component for Sentry.ErrorBoundary fallback
  // See: https://docs.sentry.io/platforms/javascript/guides/react/components/errorboundary/
  return (
    <Sentry.ErrorBoundary fallback="An error has occurred. Please refresh and try again.">
      <ToastContainer />
      props.children;
    </Sentry.ErrorBoundary>
  );
};

export default PageContainer;
