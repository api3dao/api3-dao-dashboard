import { ReactNode } from 'react';
import Link from '../link';
import styles from './notifications.module.scss';

type Props = {
  children: ReactNode;
  href: string;
};

const NotificationLinkButton = ({ children, href }: Props) => {
  return (
    <Link className={styles.notificationButton} href={href}>
      {children}
    </Link>
  );
};

export default NotificationLinkButton;
