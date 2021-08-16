import { Link } from 'react-router-dom';
import SignIn from '../sign-in/sign-in';
import { MobileMenu } from '../menu';
import { images } from '../../utils';
import styles from './navigation.module.scss';

const Navigation = () => {
  return (
    <div className={styles.navigation}>
      <div className={styles.navigationMenu}>
        <Link to="/" data-cy="api3-logo">
          <img src={images.api3LogoWhite} alt="logo" height="36" width="116" />
        </Link>
        <MobileMenu />
      </div>
      <SignIn position="navigation" />
    </div>
  );
};

export default Navigation;
