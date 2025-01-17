import { BaseLayout } from '../../components/layout';
import styles from './not-found.module.scss';
import { images } from '../../utils';
import Button from '../../components/button';

const NotFoundPage = () => {
  return (
    <BaseLayout title="404 Not Found">
      <div className={styles.wrapper}>
        <img src={images.notFound} alt="404" className={styles.image} />

        <div className={styles.content}>
          <div className={styles.text}>
            <h1>Uh oh, that page doesn’t exist.</h1>
            <p>Let’s get you back to home.</p>
          </div>

          <Button href="/" type="primary" className={styles.button} size="sm" md={{ size: 'lg' }}>
            Staking
          </Button>
        </div>
      </div>
    </BaseLayout>
  );
};

export default NotFoundPage;
