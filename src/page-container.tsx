import * as Sentry from '@sentry/react';
import { HelmetProvider, Helmet } from 'react-helmet-async';
import { ToastContainer } from 'react-toastify';
import { images, preloadImageList } from './utils';
import { useTransactionNotifications } from './contracts';

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
      <HelmetProvider>
        {/* Helmet children can be overridden in components lower down the tree */}
        <Helmet>
          <title>API3 DAO</title>
          {/* Preload any important images here */}
          {/* https://web.dev/preload-responsive-images/ */}
          {(Object.keys(images) as Array<keyof typeof images>).map((image) => {
            const rel = preloadImageList.includes(images[image]) ? 'preload' : 'prefetch';
            return <link rel={rel} as="image" href={images[image]} key={image} />;
          })}
        </Helmet>

        <ToastContainer />

        {props.children}
      </HelmetProvider>
    </Sentry.ErrorBoundary>
  );
};

export default PageContainer;
