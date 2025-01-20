import { ReactNode, useState } from 'react';
import { Helmet } from 'react-helmet-async';
import Navigation from '../navigation';
import Header from '../header';
import styles from './layout.module.scss';
import Button from '../button';
import ErrorReportingNotice from './error-reporting-notice';
import { DesktopMenu } from '../menu';
import ExternalLink from '../external-link';
import { ALLOW_ANALYTICS, ALLOW_ERROR_REPORTING } from '../../utils/analytics';

type Props = {
  children: ReactNode;
  title: string;
  subtitle?: string;
};

const Layout = ({ children, title, subtitle }: Props) => {
  return (
    <BaseLayout title={title}>
      <Header title={title} subtitle={subtitle} />
      {children}
    </BaseLayout>
  );
};

interface BaseLayoutProps {
  children: ReactNode;
  title: string;
}

export const BaseLayout = ({ children, title }: BaseLayoutProps) => {
  const [showNotice, setShowNotice] = useState(
    () => localStorage.getItem(ALLOW_ERROR_REPORTING) === null || localStorage.getItem(ALLOW_ANALYTICS) === null
  );

  const footerLinks = [
    { text: 'Api3.org', href: 'https://api3.org/' },
    { text: 'Error Reporting', onClick: () => setShowNotice(true) },
    { text: 'Github', href: 'https://github.com/api3dao/api3-dao-dashboard' },
  ];

  const footerLinksSecondRow = [
    { text: 'Privacy Policy', href: 'https://api3.org/privacy-policy/' },
    { text: 'Privacy and Cookies', href: 'https://api3.org/privacy-and-cookies/' },
    { text: 'Terms and Conditions', href: 'https://api3.org/terms-and-conditions/' },
  ];

  const actualYear = new Date().getFullYear();

  return (
    <>
      <Helmet>
        <title>{`API3 DAO | ${title}`}</title>
      </Helmet>

      <div className={styles.layout}>
        <Navigation />
        <div className={styles.content}>
          <DesktopMenu />
          <main className={styles.main}>{children}</main>
        </div>
        <footer className={styles.footer}>
          {showNotice ? (
            <ErrorReportingNotice onShowNotice={setShowNotice} />
          ) : (
            <div className={styles.footerRows}>
              <div className={styles.footerFirstRow}>
                {footerLinks.map((link) =>
                  link.href ? (
                    <ExternalLink href={link.href} key={link.text}>
                      {link.text}
                    </ExternalLink>
                  ) : (
                    <Button
                      key={link.text}
                      type="menu-link-secondary"
                      onClick={link.onClick}
                      size="xs"
                      md={{ size: 'sm' }}
                    >
                      {link.text}
                    </Button>
                  )
                )}
              </div>
              <div className={styles.footerSecondRow}>
                <div className={styles.copyright}>&copy; {actualYear} API3 Foundation</div>
                <div className={styles.privacyLinks}>
                  {footerLinksSecondRow.map((link) => (
                    <ExternalLink href={link.href} key={link.text}>
                      {link.text}
                    </ExternalLink>
                  ))}
                </div>
              </div>
            </div>
          )}
        </footer>
      </div>
    </>
  );
};

export default Layout;
