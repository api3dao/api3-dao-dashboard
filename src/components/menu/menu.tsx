import { useState } from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { useChainData } from '../../chain-data';
import { images } from '../../utils';
import classNames from 'classnames';
import DashboardIcon from './dashboard-icon';
import ProposalsIcon from './proposals-icon';
import HistoryIcon from './history-icon';
import TrackerIcon from './tracker-icon';
import ForumIcon from './forum-icon';
import MarketIcon from './market-icon';
import DocsIcon from './docs-icon';
import SignIn from '../sign-in/sign-in';
import styles from './menu.module.scss';
import ExternalLink from '../external-link';

const MenuItems = [
  { to: '/', icon: DashboardIcon, text: 'Staking' },
  { to: '/governance', icon: ProposalsIcon, text: 'Governance' },
  { to: '/history', icon: HistoryIcon, text: 'History' },
];

const ExternalLinks = [
  { to: 'https://tracker.api3.org/', icon: TrackerIcon, text: 'Tracker' },
  { to: 'https://forum.api3.org/', icon: ForumIcon, text: 'Forum' },
  { to: 'https://market.api3.org/', icon: MarketIcon, text: 'Api3 Market' },
  { to: 'https://docs.api3.org/', icon: DocsIcon, text: 'Docs' },
];

export const DesktopMenu = () => {
  const { pathname } = useLocation();
  return (
    <div className={styles.menu} data-cy="desktop-menu">
      {/* isActive is required for the root path otherwise the link stays highlighted on other pages */}
      {MenuItems.map(({ to, icon: Icon, text }) => (
        <NavLink
          key={to}
          to={to}
          activeClassName={styles.activeNavLink}
          className={styles.navLink}
          isActive={() => [to].includes(pathname)}
        >
          <div className={styles.menuItem}>
            <Icon />
            <p className={styles.menuItemText}>{text}</p>
          </div>
        </NavLink>
      ))}
      <div className={styles.externalLinksHeader}>External Links</div>
      {ExternalLinks.map(({ to, text, icon: Icon }) => (
        <ExternalLink key={to} className={styles.externalLink} href={to}>
          <Icon />
          {text}
          <img src={images.externalLink} alt="" />
        </ExternalLink>
      ))}
    </div>
  );
};

export const MobileMenu = () => {
  const [open, setOpen] = useState(false);
  const { pathname } = useLocation();
  const { provider } = useChainData();

  return (
    <div className={styles.mobileMenuWrapper}>
      <div className={classNames(styles.menuIconWrapper, { [styles.connected]: !!provider })}>
        {provider && <img src={images.connected} alt="connected icon" />}
        <img className={styles.menuIcon} onClick={() => setOpen(true)} src={images.hamburgerMenu} alt="menu icon" />
      </div>
      <div className={classNames(styles.mobileMenu, { [styles.open]: open })}>
        <div className={styles.mobileMenuHeader}>
          <img src={images.api3DaoLogoDarkTheme} alt="dark logo" width={80} />
          <img onClick={() => setOpen(false)} src={images.close} alt="close icon" />
        </div>
        <div className={styles.mobileMenuScrollWrap}>
          <div className={styles.mobileMenuContent}>
            {/* isActive is required for the root path otherwise the link stays highlighted on other pages */}
            {MenuItems.map(({ to, icon: Icon, text }) => (
              <NavLink key={to} to={to} activeClassName={styles.activeNavLink} isActive={() => [to].includes(pathname)}>
                <div className={styles.menuMobileItem}>
                  <Icon />
                  <p className={styles.menuMobileItemText}>{text}</p>
                </div>
              </NavLink>
            ))}
            <div className={styles.externalLinksHeader}>External Links</div>
            {ExternalLinks.map(({ to, text, icon: Icon }) => (
              <ExternalLink key={to} className={styles.externalLink} href={to}>
                <Icon />
                {text}
                <img src={images.externalLink} alt="" />
              </ExternalLink>
            ))}
          </div>
          <div className={classNames(styles.mobileMenuFooter, { [styles.borderTop]: provider })}>
            <SignIn position="mobileMenu" dark />
          </div>
        </div>
      </div>
    </div>
  );
};
