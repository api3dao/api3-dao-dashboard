import { useTransactionNotifications } from '../contracts';

interface Props {
  children: JSX.Element;
}

// NOTE: this must have access to the global state context
const PageContainer = (props: Props) => {
  // Whenever a new transaction is added to the state, display notifications for it
  useTransactionNotifications();

  return props.children;
};

export default PageContainer;
