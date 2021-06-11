import './styles/variables.module.scss';
import { HashRouter as Router, Switch, Route } from 'react-router-dom';
import { ToastContainer } from 'react-toastify';
import ChainDataContextProvider from './chain-data';
import Dashboard from './pages/dashboard';
import Proposals from './pages/proposals';
import ProposalDetails from './pages/proposal-commons/proposal-details';
import HistoryDetails from './pages/history-details';
import History from './pages/history';

function App() {
  return (
    <ChainDataContextProvider>
      <ToastContainer />
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
    </ChainDataContextProvider>
  );
}

export default App;
