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
  hideHeader?: boolean;
};

const Layout = ({ children, title, subtitle, hideHeader = false }: Props) => {
  if (hideHeader) {
    return <BaseLayout title={title}>{children}</BaseLayout>;
  }

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
    { text: 'About API3', href: 'https://api3.org/' },
    { text: 'Error Reporting', onClick: () => setShowNotice(true) },
    { text: 'Github', href: 'https://github.com/api3dao/api3-dao-dashboard' },
  ];

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
            <div className={styles.footerContent}>
              {footerLinks.map((link) =>
                link.href ? (
                  <ExternalLink href={link.href}>{link.text}</ExternalLink>
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
          )}
        </footer>
      </div>
    </>
  );
};

export default Layout;
