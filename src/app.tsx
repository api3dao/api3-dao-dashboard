import './styles/main.scss';
import { BrowserRouter as Router, Switch, Route } from 'react-router-dom';
import ChainDataContextProvider from './chain-data';
import GlobalSubscriptions from './components/global-subscriptions/global-subscriptions';
import Dashboard from './pages/dashboard';
import Proposals from './pages/proposals';

function App() {
  return (
    <ChainDataContextProvider>
      <GlobalSubscriptions />
      <Router>
        {/* NOTE: The first matching root is used. This imples that `/` must be last */}
        <Switch>
          <Route path="/dashboard">
            <Dashboard />
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
