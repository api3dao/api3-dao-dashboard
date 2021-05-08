import './App.css';
import { BrowserRouter as Router, Switch, Route, Link } from 'react-router-dom';
import WalletConnectDemo from './wallet-connect-demo';
import ChainDataContextProvider from './chain-data';
import DashboardPanels from './dashboard-panels';

const Dashboard = () => {
  return (
    <div>
      dashboard
      <DashboardPanels />
    </div>
  );
};

const Proposals = () => {
  return <div>proposals</div>;
};

function App() {
  return (
    <ChainDataContextProvider>
      <Router>
        {/* TODO: remove */}
        <nav>
          <ul>
            <li>
              <Link to="/">Home</Link>
            </li>
            <li>
              <Link to="/dashboard">Dashboard</Link>
            </li>
            <li>
              <Link to="/proposals">Proposals</Link>
            </li>
          </ul>
        </nav>

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
