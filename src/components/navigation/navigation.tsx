import Button from '../button/button';
import Menu from '../menu/menu';
import './navigation.scss';

const Navigation = () => {
  return (
    <div className="navigation">
      <div className="navigation-menu">
        <img src="/api3-logo-white.svg" alt="logo" />
        <Menu />
      </div>
      <Button>Connect Wallet</Button>
    </div>
  );
};

export default Navigation;
