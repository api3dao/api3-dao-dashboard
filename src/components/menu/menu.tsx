import { NavLink, useLocation } from 'react-router-dom';
import DashboardIcon from './dashboard-icon';
import ProposalsIcon from './proposals-icon';
import HistoryIcon from './history-icon';
import styles from './menu.module.scss';
import globalStyles from '../../styles/global-styles.module.scss';

const Menu = () => {
  const { pathname } = useLocation();

  return (
    <div className={styles.menu}>
      <NavLink
        activeClassName={styles.menuActiveItem}
        to="/dashboard"
        isActive={() => ['/', '/dashboard', '/dashboard/'].includes(pathname)}
      >
        <div className={styles.menuItem}>
          <div className={styles.menuActiveLine} />
          <DashboardIcon />
          <p className={`${styles.menuItemText} ${globalStyles.textSmall}`}>Staking</p>
        </div>
      </NavLink>
      <NavLink activeClassName={styles.menuActiveItem} to="/proposals">
        <div className={styles.menuItem}>
          <div className={styles.menuActiveLine} />
          <ProposalsIcon />
          <p className={`${styles.menuItemText} ${globalStyles.textSmall}`}>Governance</p>
        </div>
      </NavLink>
      <NavLink activeClassName={styles.menuActiveItem} to="/history">
        <div className={styles.menuItem}>
          <div className={styles.menuActiveLine} />
          <HistoryIcon />
          <p className={`${styles.menuItemText} ${globalStyles.textSmall}`}>History</p>
        </div>
      </NavLink>
    </div>
  );
};

export default Menu;
