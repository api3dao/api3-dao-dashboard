import { ReactNode } from 'react';
import Navigation from '../navigation/navigation';
import Header from '../header/header';
import './layout.scss';

type Props = {
  children: ReactNode;
  title: string;
  subtitle: string;
};

const Layout = ({ children, title, subtitle }: Props) => {
  return (
    <div className="layout">
      <Navigation />
      <div className="container">
        <Header title={title} subtitle={subtitle} />
        {children}
      </div>
    </div>
  );
};

export default Layout;
