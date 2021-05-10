import Layout from '../../components/layout/layout';
import DashboardPanels from './dashboard-panels';

const Dashboard = () => {
  return (
    <Layout title="dashboard" subtitle="dashboard">
      <DashboardPanels />
    </Layout>
  );
};

export default Dashboard;
