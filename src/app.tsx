import { HashRouter as Router, Switch, Route } from 'react-router-dom';
import ChainDataContextProvider from './chain-data';
import PageContainer from './pages/page-container';
import Dashboard from './pages/dashboard';
import Proposals from './pages/proposals';
import ProposalDetails from './pages/proposal-commons/proposal-details';
import HistoryDetails from './pages/history-details';
import History from './pages/history';
import './styles/variables.module.scss';

function App() {
  return (
    <ChainDataContextProvider>
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
  );
}

export default App;
