import { useEffect } from 'react';
import { BaseLayout } from './components/layout';
import { HashRouter as Router, Switch, Route } from 'react-router-dom';
import { HelmetProvider, Helmet } from 'react-helmet-async';
import { images, preloadImageList, useOnMountEffect } from './utils';
import { FallbackRender } from '@sentry/react/dist/errorboundary';
import { ToastContainer } from 'react-toastify';
import { useTransactionNotifications } from './contracts';
import { identifyAppEntryPage } from './components/back-button';
import * as Sentry from '@sentry/react';
import ChainDataContextProvider from './chain-data';
import Dashboard from './pages/dashboard';
import History from './pages/history';
import HistoryDetails from './pages/history-details';
import NotFoundPage from './pages/not-found';
import ProposalDetailsPage from './pages/proposal-commons/proposal-details';
import Proposals from './pages/proposals';
import Vesting from './pages/vesting';
import Policies from './pages/my-policies';
import Claims from './pages/claims';
import ClaimDetails from './pages/claim-details';
import PolicyDetails from './pages/policy-details';
import PolicySelect from './pages/policy-select';
import NewClaim from './pages/new-claim';
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
          <Route path="/policies" exact>
            <Policies />
          </Route>
          <Route path="/claims/new" exact>
            <PolicySelect />
          </Route>
          <Route path="/claims/:claimId" exact>
            <ClaimDetails />
          </Route>
          <Route path="/claims" exact>
            <Claims />
          </Route>
          <Route path="/policies/:policyId/claims/new" exact>
            <NewClaim />
          </Route>
          <Route path="/policies/:policyId" exact>
            <PolicyDetails />
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
  useEffect(() => {
    identifyAppEntryPage();
  }, []);

  return (
    <ChainDataContextProvider>
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

        <AppContent />
      </HelmetProvider>
    </ChainDataContextProvider>
  );
};

export default App;
