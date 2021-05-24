import React, { ReactNode } from 'react';
import Navigation from '../navigation/navigation';
import Header from '../header/header';
import './layout.scss';

type Props = {
  children: ReactNode;
  title: string;
  sectionTitle: string;
};

const Layout = ({ children, title, sectionTitle }: Props) => {
  return (
    <BaseLayout>
      <Header title={title} sectionTitle={sectionTitle} />
      {children}
    </BaseLayout>
  );
};

export const BaseLayout: React.FC = ({ children }) => {
  return (
    <div className="layout">
      <Navigation />
      <div className="container">{children}</div>
      <img className="layout-texture" src="/texture.png" alt="texture background" />
    </div>
  );
};

export default Layout;
