import './App.css';
import { BrowserRouter as Router, Switch, Route } from 'react-router-dom';
import WalletConnectDemo from './wallet-connect-demo';
import ChainDataContextProvider from './chain-data';
import Dashboard from './pages/dashboard';
import Proposals from './pages/proposals';

function App() {
  return (
    <ChainDataContextProvider>
      <Router>
        <WalletConnectDemo />
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
