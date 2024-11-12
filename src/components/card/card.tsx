import { ReactNode } from 'react';
import styles from './card.module.scss';

type Props = {
  header: ReactNode;
  content: ReactNode;
  contentFooter?: ReactNode;
  children?: ReactNode;
};

type HeaderProps = {
  children: ReactNode;
};

export const Header = ({ children }: HeaderProps) => {
  return <div className={styles.cardHeader}>{children}</div>;
};

const Card = (props: Props) => {
  const { header, content, contentFooter, children } = props;

  return (
    <div className={styles.card}>
      {header}
      {content}
      {contentFooter && <div className={styles.contentFooter}>{contentFooter}</div>}
      {children && <div className={styles.cardChildren}>{children}</div>}
    </div>
  );
};

export default Card;
