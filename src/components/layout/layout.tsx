import React, { ReactNode } from 'react';
import { Helmet } from 'react-helmet-async';
import Navigation from '../navigation/navigation';
import Header from '../header/header';
import styles from './layout.module.scss';

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
  return (
    <>
      <Helmet>
        <title>{`API3 DAO | ${title}`}</title>
      </Helmet>

      <div className={styles.layout}>
        <Navigation />
        <div className={styles.container}>{children}</div>
        <img className={styles.layoutTexture} src="/texture.png" alt="texture background" />
      </div>
    </>
  );
};

export default Layout;
