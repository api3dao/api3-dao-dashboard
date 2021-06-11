import React, { ReactNode } from 'react';
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
    <BaseLayout>
      <Header title={title} subtitle={subtitle} />
      {children}
    </BaseLayout>
  );
};

export const BaseLayout: React.FC = ({ children }) => {
  return (
    <div className={styles.layout}>
      <Navigation />
      <div className={styles.container}>{children}</div>
      <img className={styles.layoutTexture} src="/texture.png" alt="texture background" />
    </div>
  );
};

export default Layout;
