import { ReactNode, useState } from 'react';
import { Helmet } from 'react-helmet-async';
import Navigation from '../navigation';
import Header from '../header';
import { ERROR_REPORTING_CONSENT_KEY_NAME } from '../../utils';
import styles from './layout.module.scss';
import Button from '../button';
import ErrorReportingNotice from './error-reporting-notice';
import { DesktopMenu } from '../menu';

type Props = {
  children: ReactNode;
  title: string;
  subtitle?: string;
};

const Layout = ({ children, title, subtitle }: Props) => {
  return (
    <BaseLayout subtitle={title}>
      <Header title={title} subtitle={subtitle} />
      {children}
    </BaseLayout>
  );
};

interface BaseLayoutProps {
  children: ReactNode;
  subtitle: string;
}

export const BaseLayout = ({ children, subtitle }: BaseLayoutProps) => {
  const [errorReportingNoticeOpen, setErrorReportingNoticeOpen] = useState(
    localStorage.getItem(ERROR_REPORTING_CONSENT_KEY_NAME) === null
  );

  const footerLinks = [
    { text: 'About API3', href: 'https://api3.org/' },
    { text: 'Error Reporting', onClick: () => setErrorReportingNoticeOpen(true) },
    { text: 'Github', href: 'https://github.com/api3dao/api3-dao-dashboard' },
  ];

  return (
    <>
      <Helmet>
        <title>{`API3 DAO | ${subtitle}`}</title>
      </Helmet>

      <div className={styles.layout}>
        <Navigation />
        <div className={styles.content}>
          <DesktopMenu />
          <main className={styles.main}>{children}</main>
        </div>
        <footer className={styles.footer}>
          {errorReportingNoticeOpen ? (
            <ErrorReportingNotice onClose={() => setErrorReportingNoticeOpen(false)} />
          ) : (
            <div className={styles.footerContent}>
              {footerLinks.map((link) => (
                <Button
                  key={link.text}
                  type="menu-link-secondary"
                  onClick={link.onClick}
                  href={link.href}
                  size="xs"
                  md={{ size: 'sm' }}
                >
                  {link.text}
                </Button>
              ))}
            </div>
          )}
        </footer>
      </div>
    </>
  );
};

export default Layout;
