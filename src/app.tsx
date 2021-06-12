import * as Sentry from '@sentry/react';
import { HashRouter as Router, Switch, Route } from 'react-router-dom';
import { ToastContainer } from 'react-toastify';
import ChainDataContextProvider from './chain-data';
import PageContainer from './pages/page-container';
import Dashboard from './pages/dashboard';
import Proposals from './pages/proposals';
import ProposalDetails from './pages/proposal-commons/proposal-details';
import HistoryDetails from './pages/history-details';
import History from './pages/history';
import './styles/variables.module.scss';

function App() {
  // TODO: Implement a nicely designed error page/component for Sentry.ErrorBoundary fallback
  // See: https://docs.sentry.io/platforms/javascript/guides/react/components/errorboundary/
  return (
    <Sentry.ErrorBoundary fallback="An error has occurred. Please refresh and try again.">
      <ChainDataContextProvider>
        <ToastContainer />
        <PageContainer>
          <Router>
            <Switch>
              <Route path="/dashboard" exact>
                <Dashboard />
              </Route>
              <Route path="/proposals/:typeAndId" exact>
                <ProposalDetails />
              </Route>
              <Route path="/proposals" exact>
                <Proposals />
              </Route>
              <Route path="/history/:typeAndId" exact>
                <HistoryDetails />
              </Route>
              <Route path="/history" exact>
                <History />
              </Route>
              <Route path="/" exact>
                <Dashboard />
              </Route>
              {/* NOTE: This fallback route must be last */}
              <Route path="/">
                {/* TODO: Not found page */}
                <h5 style={{ color: 'black' }}>Not found</h5>
              </Route>
            </Switch>
          </Router>
        </PageContainer>
      </ChainDataContextProvider>
    </Sentry.ErrorBoundary>
  );
}

export default App;
