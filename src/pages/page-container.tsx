import { useTransactionNotifications } from '../contracts';

interface Props {
  children: JSX.Element;
}

const PageContainer = (props: Props) => {
  useTransactionNotifications();

  return props.children;
};

export default PageContainer;
