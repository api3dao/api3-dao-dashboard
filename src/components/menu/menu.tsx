import { useState } from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { useChainData } from '../../chain-data';
import { images } from '../../utils';
import classNames from 'classnames';
import DashboardIcon from '../icons/dashboard-icon';
import ProposalsIcon from '../icons/proposals-icon';
import HistoryIcon from '../icons/history-icon';
import PoliciesIcon from '../icons/policies-icon';
import ClaimsIcon from '../icons/claims-icons';
import TrackerIcon from '../icons/tracker-icon';
import MarketIcon from '../icons/market-icon';
import ExternalLinkIcon from '../icons/external-link-icon';
import ExternalLink from '../external-link';
import SignIn from '../sign-in/sign-in';
import styles from './menu.module.scss';
import globalStyles from '../../styles/global-styles.module.scss';

export const DesktopMenu = () => {
  const { pathname } = useLocation();
  return (
    <nav className={styles.desktopMenu} data-cy="desktop-menu">
      {/* isActive is required for the root path otherwise the link stays highlighted on other pages */}
      <NavLink activeClassName={styles.menuActiveItem} to="/" isActive={() => ['/'].includes(pathname)}>
        <div className={styles.menuItem}>
          <div className={styles.menuActiveLine} />
          <DashboardIcon aria-hidden />
          <p className={classNames(styles.menuItemText, globalStyles.textSmall)}>Staking</p>
        </div>
      </NavLink>
      <NavLink activeClassName={styles.menuActiveItem} to="/governance">
        <div className={styles.menuItem}>
          <div className={styles.menuActiveLine} />
          <ProposalsIcon aria-hidden />
          <p className={classNames(styles.menuItemText, globalStyles.textSmall)}>Governance</p>
        </div>
      </NavLink>
      <NavLink activeClassName={styles.menuActiveItem} to="/history">
        <div className={styles.menuItem}>
          <div className={styles.menuActiveLine} />
          <HistoryIcon aria-hidden />
          <p className={classNames(styles.menuItemText, globalStyles.textSmall)}>History</p>
        </div>
      </NavLink>
      <NavLink activeClassName={styles.menuActiveItem} to="/policies">
        <div className={styles.menuItem}>
          <div className={styles.menuActiveLine} />
          <PoliciesIcon aria-hidden />
          <p className={classNames(styles.menuItemText, globalStyles.textSmall)}>My Policies</p>
        </div>
      </NavLink>
      <NavLink activeClassName={styles.menuActiveItem} to="/claims">
        <div className={styles.menuItem}>
          <div className={styles.menuActiveLine} />
          <ClaimsIcon aria-hidden />
          <p className={classNames(styles.menuItemText, globalStyles.textSmall)}>My Claims</p>
        </div>
      </NavLink>

      <section className={styles.externalLinks}>
        <h6>
          <span>External Links</span> <div>&nbsp;</div>
        </h6>
        <ExternalLink href="https://tracker.api3.org">
          <div className={styles.menuItem}>
            <TrackerIcon aria-hidden />
            <p className={classNames(styles.menuItemText, globalStyles.textSmall)}>
              API3 Tracker
              <ExternalLinkIcon aria-hidden className={globalStyles.tertiaryColor} />
            </p>
          </div>
        </ExternalLink>
        <ExternalLink href="https://market.api3.org">
          <div className={styles.menuItem}>
            <MarketIcon aria-hidden />
            <p className={classNames(styles.menuItemText, globalStyles.textSmall)}>
              API3 Market
              <ExternalLinkIcon aria-hidden className={globalStyles.tertiaryColor} />
            </p>
          </div>
        </ExternalLink>
      </section>
    </nav>
  );
};

export const MobileMenu = () => {
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
          <nav className={styles.mobileMenuContent}>
            {/* isActive is required for the root path otherwise the link stays highlighted on other pages */}
            <NavLink activeClassName={styles.menuActiveItem} to="/" isActive={() => ['/'].includes(pathname)}>
              <div className={styles.menuMobileItem}>
                <DashboardIcon aria-hidden />
                <p className={styles.menuMobileItemText}>Staking</p>
              </div>
            </NavLink>
            <NavLink activeClassName={styles.menuActiveItem} to="/governance">
              <div className={styles.menuMobileItem}>
                <ProposalsIcon aria-hidden />
                <p className={styles.menuMobileItemText}>Governance</p>
              </div>
            </NavLink>
            <NavLink activeClassName={styles.menuActiveItem} to="/history">
              <div className={styles.menuMobileItem}>
                <HistoryIcon aria-hidden />
                <p className={styles.menuMobileItemText}>History</p>
              </div>
            </NavLink>
            <NavLink activeClassName={styles.menuActiveItem} to="/policies">
              <div className={styles.menuMobileItem}>
                <PoliciesIcon aria-hidden />
                <p className={styles.menuMobileItemText}>My Policies</p>
              </div>
            </NavLink>
            <NavLink activeClassName={styles.menuActiveItem} to="/claims">
              <div className={styles.menuMobileItem}>
                <ClaimsIcon aria-hidden />
                <p className={styles.menuMobileItemText}>My Claims</p>
              </div>
            </NavLink>
          </nav>
          <div className={classNames(styles.mobileMenuFooter, { [styles.borderTop]: provider })}>
            <SignIn position="mobileMenu" dark />
          </div>
        </div>
      </div>
    </div>
  );
};
