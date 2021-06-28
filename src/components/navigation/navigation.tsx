import { Link } from 'react-router-dom';
import SignIn from '../sign-in/sign-in';
import Menu from '../menu/menu';
import { images } from '../../utils';
import styles from './navigation.module.scss';

const Navigation = () => {
  return (
    <div className={styles.navigation}>
      <div className={styles.navigationMenu}>
        <Link to="/">
          <img src={images.api3LogoWhite} alt="logo" height="36" width="116" />
        </Link>
        <Menu />
      </div>
      <SignIn position="navigation" />
    </div>
  );
};

export default Navigation;
