import * as Sentry from '@sentry/react';
import type { FallbackRender } from '@sentry/react/dist/errorboundary';
import { Web3Modal } from '@web3modal/react';
import { HelmetProvider, Helmet } from 'react-helmet-async';
import { HashRouter as Router, Switch, Route } from 'react-router-dom';
import { ToastContainer } from 'react-toastify';
import { WagmiConfig } from 'wagmi';

import ChainDataContextProvider from './chain-data';
import { BaseLayout } from './components/layout';
import { useTransactionNotifications } from './contracts';
import Dashboard from './pages/dashboard';
import History from './pages/history';
import HistoryDetails from './pages/history-details';
import NotFoundPage from './pages/not-found';
import ProposalDetailsPage from './pages/proposal-commons/proposal-details';
import Proposals from './pages/proposals';
import Vesting from './pages/vesting';
import { images, preloadImageList, useOnMountEffect } from './utils';
import { wagmiClient, ethereumClient, projectId } from './wallet-connect';
import './styles/variables.module.scss';

const ErrorBoundary: FallbackRender = (props) => {
  const { error } = props;

  // When the ErrorBoundary component is rendered, there must have been uncaught error somewhere in React component. We
  // want to send this exception to Sentry.
  useOnMountEffect(() => {
    Sentry.captureException(error);
  });

  return (
    <BaseLayout subtitle="Unexpected error">
      <div>An unexpected error has occurred. Please refresh the page and try again.</div>
    </BaseLayout>
  );
};

// NOTE: This component needs to have access to "ChainDataContextProvider"
const AppContent = () => {
  // Whenever a new transaction is added to the state, display notifications for it
  useTransactionNotifications();

  return (
    // Sentry.ErrorBoundary requires 'fallback' to be React component so we can't pass a string there
    <Router>
      <Sentry.ErrorBoundary fallback={(props) => <ErrorBoundary {...props} />}>
        <ToastContainer />

        <Switch>
          <Route path="/governance/:typeAndVoteId" exact>
            <ProposalDetailsPage />
          </Route>
          <Route path="/governance" exact>
            <Proposals />
          </Route>
          <Route path="/history/:typeAndVoteId" exact>
            <HistoryDetails />
          </Route>
          <Route path="/history" exact>
            <History />
          </Route>
          <Route path="/vesting" exact>
            <Vesting />
          </Route>
          <Route path="/" exact>
            <Dashboard />
          </Route>
          {/* NOTE: This fallback route must be last */}
          <Route path="/">
            <NotFoundPage />
          </Route>
        </Switch>
      </Sentry.ErrorBoundary>
    </Router>
  );
};

const App = () => {
  return (
    <WagmiConfig client={wagmiClient}>
      <ChainDataContextProvider>
        <HelmetProvider>
          {/* Helmet children can be overridden in components lower down the tree */}
          <Helmet>
            <title>API3 DAO</title>
            {/* Preload any important images here */}
            {/* https://web.dev/preload-responsive-images/ */}
            {(Object.keys(images) as (keyof typeof images)[]).map((image) => {
              const rel = preloadImageList.includes(images[image]) ? 'preload' : 'prefetch';
              return <link rel={rel} as="image" href={images[image]} key={image} />;
            })}
          </Helmet>

          <AppContent />
        </HelmetProvider>
      </ChainDataContextProvider>
      <Web3Modal projectId={projectId} ethereumClient={ethereumClient} />
    </WagmiConfig>
  );
};

export default App;
