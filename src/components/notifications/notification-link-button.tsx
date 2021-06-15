import { ReactNode } from 'react';
import styles from './notifications.module.scss';

type Props = {
  children: ReactNode;
  href: string;
};

const NotificationLinkButton = ({ children, href }: Props) => {
  return (
    <a className={styles.notificationButton} href={href} target="_blank" rel="noopener noreferrer">
      {children}
    </a>
  );
};

export default NotificationLinkButton;
