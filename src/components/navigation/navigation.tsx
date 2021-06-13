import SignIn from '../sign-in/sign-in';
import Menu from '../menu/menu';
import styles from './navigation.module.scss';

const Navigation = () => {
  return (
    <div className={styles.navigation}>
      <div className={styles.navigationMenu}>
        <img src="/api3-logo-white.svg" alt="logo" />
        <Menu />
      </div>
      <SignIn position="navigation" />
    </div>
  );
};

export default Navigation;
