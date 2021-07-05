import { ReactNode, useState } from 'react';
import { Helmet } from 'react-helmet-async';
import Navigation from '../navigation/navigation';
import Header from '../header/header';
import { ERROR_REPORTING_CONSENT_KEY_NAME, images, insertInBetween } from '../../utils';
import styles from './layout.module.scss';
import ExternalLink from '../external-link';
import Button from '../button/button';
import ErrorReportingNotice from './error-reporting-notice';

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

  const links = [
    // TODO: Are these the correct URLs?
    { text: 'About API3', href: 'https://api3.org/' },
    { text: 'Docs', href: 'https://docs.api3.org/pre-alpha/members/' },
    { text: 'Error reporting', onClick: () => setErrorReportingNoticeOpen(true) },
    { text: 'Github', href: 'https://github.com/api3dao/api3-dao-dashboard' },
  ];

  return (
    <>
      <Helmet>
        <title>{`API3 DAO | ${subtitle}`}</title>
      </Helmet>

      <div className={styles.layout}>
        <Navigation />
        <div className={styles.container}>{children}</div>
        <footer className={styles.footer}>
          {errorReportingNoticeOpen ? (
            <ErrorReportingNotice onClose={() => setErrorReportingNoticeOpen(false)} />
          ) : (
            <div className={styles.footerContent}>
              {insertInBetween(
                links.map((link) => {
                  if (link.href) return <ExternalLink href={link.href}>{link.text}</ExternalLink>;
                  else
                    return (
                      <Button type="text" className={styles.externalLinkButton} onClick={link.onClick}>
                        {link.text}
                      </Button>
                    );
                }),
                <span className={styles.linkSeparator}>|</span>
              )}
            </div>
          )}
        </footer>

        <img className={styles.layoutTexture} src={images.texture} alt="texture background" />
      </div>
    </>
  );
};

export default Layout;
