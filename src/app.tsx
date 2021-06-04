import './styles/variables.module.scss';
import { HashRouter as Router, Switch, Route } from 'react-router-dom';
import ChainDataContextProvider from './chain-data';
import Dashboard from './pages/dashboard';
import Proposals from './pages/proposals';
import ProposalDetails from './pages/proposal-details';

function App() {
  return (
    <ChainDataContextProvider>
      <Router>
        {/* NOTE: The first matching root is used. This imples that `/` must be last */}
        <Switch>
          <Route path="/dashboard">
            <Dashboard />
          </Route>
          <Route path="/proposals/:typeAndId">
            <ProposalDetails />
          </Route>
          <Route path="/proposals">
            <Proposals />
          </Route>
          <Route path="/">
            <Dashboard />
          </Route>
        </Switch>
      </Router>
    </ChainDataContextProvider>
  );
}

export default App;
