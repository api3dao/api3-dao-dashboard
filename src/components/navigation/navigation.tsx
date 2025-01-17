import { Link } from 'react-router-dom';
import SignIn from '../sign-in/sign-in';
import { MobileMenu } from '../menu';
import { images } from '../../utils';
import styles from './navigation.module.scss';

const Navigation = () => {
  return (
    <div className={styles.navigation}>
      <Link to="/" data-cy="api3-logo">
        <img src={images.api3DaoLogoLightTheme} alt="logo" className={styles.api3DaoLogo} />
      </Link>
      <div className={styles.right}>
        <SignIn position="navigation" />
        <MobileMenu />
      </div>
    </div>
  );
};

export default Navigation;
