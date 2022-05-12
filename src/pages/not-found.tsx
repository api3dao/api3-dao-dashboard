import Layout from '../components/layout';
import { NavLink } from 'react-router-dom';

const NotFoundPage = () => {
  return (
    <Layout title="Not found">
      <p>
        <NavLink to="/">Return Home</NavLink>
      </p>
    </Layout>
  );
};

export default NotFoundPage;
