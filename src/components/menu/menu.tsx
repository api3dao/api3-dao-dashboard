import { NavLink, useLocation } from 'react-router-dom';
import DashboardIcon from './dashboard-icon';
import ProposalsIcon from './proposals-icon';
import HistoryIcon from './history-icon';
import './menu.scss';

const Menu = () => {
  const { pathname } = useLocation();

  return (
    <div className="menu">
      <NavLink
        activeClassName="menu-active-item"
        to="/dashboard"
        isActive={() => ['/', '/dashboard'].includes(pathname)}
      >
        <div className="menu-item">
          <div className="menu-active-line" />
          <DashboardIcon />
          <p className="menu-item-text text-small">Staking</p>
        </div>
      </NavLink>
      <NavLink activeClassName="menu-active-item" to="/proposals">
        <div className="menu-item">
          <div className="menu-active-line" />
          <ProposalsIcon />
          <p className="menu-item-text text-small">Governance</p>
        </div>
      </NavLink>
      <NavLink activeClassName="menu-active-item" to="/history">
        <div className="menu-item">
          <div className="menu-active-line" />
          <HistoryIcon />
          <p className="menu-item-text text-small">History</p>
        </div>
      </NavLink>
    </div>
  );
};

export default Menu;
