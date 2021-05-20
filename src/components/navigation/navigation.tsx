import SignIn from '../sign-in/sign-in';
import Menu from '../menu/menu';
import './navigation.scss';

const Navigation = () => {
  return (
    <div className="navigation">
      <div className="navigation-menu">
        <img src="/api3-logo-white.svg" alt="logo" />
        <Menu />
      </div>
      <SignIn />
    </div>
  );
};

export default Navigation;
