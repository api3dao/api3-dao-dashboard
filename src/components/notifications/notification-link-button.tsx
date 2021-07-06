import { ReactNode } from 'react';
import ExternalLink from '../external-link';
import styles from './notifications.module.scss';

type Props = {
  children: ReactNode;
  href: string;
};

const NotificationLinkButton = ({ children, href }: Props) => {
  return (
    <ExternalLink className={styles.notificationButton} href={href}>
      {children}
    </ExternalLink>
  );
};

export default NotificationLinkButton;
