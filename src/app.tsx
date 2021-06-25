import { HashRouter as Router, Switch, Route } from 'react-router-dom';
import ChainDataContextProvider from './chain-data';
import PageContainer from './page-container';
import Dashboard from './pages/dashboard';
import Proposals from './pages/proposals';
import ProposalDetails from './pages/proposal-commons/proposal-details';
import HistoryDetails from './pages/history-details';
import History from './pages/history';
import Vesting from './pages/vesting';
import './styles/variables.module.scss';
import NotFoundPage from './pages/not-found';

function App() {
  return (
    <ChainDataContextProvider>
      <PageContainer>
        <Router>
          <Switch>
            <Route path="/governance/:typeAndId" exact>
              <ProposalDetails />
            </Route>
            <Route path="/governance" exact>
              <Proposals />
            </Route>
            <Route path="/history/:typeAndId" exact>
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
        </Router>
      </PageContainer>
    </ChainDataContextProvider>
  );
}

export default App;
