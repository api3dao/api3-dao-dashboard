import Layout from '../../components/layout';
import styles from './not-found.module.scss';
import { images } from '../../utils';
import Button from '../../components/button';

const NotFoundPage = () => {
  return (
    <Layout title="404 Not Found" hideHeader>
      <div className={styles.wrapper}>
        <img src={images.notFound} alt="404" className={styles.image} />

        <div className={styles.content}>
          <div className={styles.text}>
            <h1>Uh oh, that page doesn’t exist.</h1>
            <p>Let’s get you back to home.</p>
          </div>

          <Button href="/" type="primary" className={styles.button} size="sm" sm={{ size: 'lg' }}>
            Explore data feeds
          </Button>
        </div>
      </div>
    </Layout>
  );
};

export default NotFoundPage;
