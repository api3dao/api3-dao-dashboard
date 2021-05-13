import { ReactNode } from 'react';
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
    <div className="layout">
      <Navigation />
      <div className="container">
        <Header title={title} sectionTitle={sectionTitle} />
        {children}
      </div>
      <img className="layout-texture" src="/texture.png" alt="texture background" />
    </div>
  );
};

export default Layout;
