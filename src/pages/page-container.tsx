import { useTransactionNotifications } from '../contracts';

interface Props {
  children: JSX.Element;
}

const PageContainer = (props: Props) => {
  // Whenever a new transaction is added to the state, display notifications for it
  useTransactionNotifications();

  return props.children;
};

export default PageContainer;
