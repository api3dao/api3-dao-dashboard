import { useState } from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { useChainData } from '../../chain-data';
import { images } from '../../utils';
import classNames from 'classnames';
import DashboardIcon from './dashboard-icon';
import ProposalsIcon from './proposals-icon';
import HistoryIcon from './history-icon';
import SignIn from '../sign-in/sign-in';
import styles from './menu.module.scss';
import globalStyles from '../../styles/global-styles.module.scss';

const DesktopMenu = () => {
  const { pathname } = useLocation();
  return (
    <div className={styles.menu} data-cy="desktop-menu">
      {/* isActive is required for the root path otherwise the link stays highlighted on other pages */}
      <NavLink activeClassName={styles.menuActiveItem} to="/" isActive={() => ['/'].includes(pathname)}>
        <div className={styles.menuItem}>
          <div className={styles.menuActiveLine} />
          <DashboardIcon />
          <p className={classNames(styles.menuItemText, globalStyles.textSmall)}>Staking</p>
        </div>
      </NavLink>
      <NavLink activeClassName={styles.menuActiveItem} to="/governance">
        <div className={styles.menuItem}>
          <div className={styles.menuActiveLine} />
          <ProposalsIcon />
          <p className={classNames(styles.menuItemText, globalStyles.textSmall)}>Governance</p>
        </div>
      </NavLink>
      <NavLink activeClassName={styles.menuActiveItem} to="/history">
        <div className={styles.menuItem}>
          <div className={styles.menuActiveLine} />
          <HistoryIcon />
          <p className={classNames(styles.menuItemText, globalStyles.textSmall)}>History</p>
        </div>
      </NavLink>
    </div>
  );
};

const MobileMenu = () => {
  const [open, setOpen] = useState(false);
  const { pathname } = useLocation();
  const { provider } = useChainData();

  return (
    <div className={styles.mobileMenuWrapper}>
      <div className={styles.menuIconWrapper}>
        {provider && <img src={images.connected} alt="connected icon" />}
        <img className={styles.menuIcon} onClick={() => setOpen(true)} src={images.hamburgerMenu} alt="menu icon" />
      </div>
      <div className={classNames(styles.mobileMenu, { [styles.open]: open })}>
        <div className={styles.mobileMenuHeader}>
          <img src={images.api3LogoDark} alt="dark logo" />
          <img className={styles.menuIcon} onClick={() => setOpen(false)} src={images.menuClose} alt="close icon" />
        </div>
        <div className={styles.mobileMenuScrollWrap}>
          <div className={styles.mobileMenuContent}>
            {/* isActive is required for the root path otherwise the link stays highlighted on other pages */}
            <NavLink activeClassName={styles.menuActiveItem} to="/" isActive={() => ['/'].includes(pathname)}>
              <div className={styles.menuMobileItem}>
                <DashboardIcon />
                <p className={styles.menuMobileItemText}>Staking</p>
              </div>
            </NavLink>
            <NavLink activeClassName={styles.menuActiveItem} to="/governance">
              <div className={styles.menuMobileItem}>
                <ProposalsIcon />
                <p className={styles.menuMobileItemText}>Governance</p>
              </div>
            </NavLink>
            <NavLink activeClassName={styles.menuActiveItem} to="/history">
              <div className={styles.menuMobileItem}>
                <HistoryIcon />
                <p className={styles.menuMobileItemText}>History</p>
              </div>
            </NavLink>
          </div>
          <div className={classNames(styles.mobileMenuFooter, { [styles.borderTop]: provider })}>
            <SignIn position="mobileMenu" dark />
          </div>
        </div>
      </div>
    </div>
  );
};

const Menu = () => (
  <>
    <DesktopMenu />
    <MobileMenu />
  </>
);

export default Menu;
