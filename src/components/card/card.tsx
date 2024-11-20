import { ReactNode } from 'react';
import styles from './card.module.scss';
import classNames from 'classnames';

type Props = {
  header: ReactNode;
  content: ReactNode;
  contentFooter?: ReactNode;
  children?: ReactNode;
  gradientBorder?: boolean;
};

type HeaderProps = {
  children: ReactNode;
};

export const Header = ({ children }: HeaderProps) => {
  return <div className={styles.cardHeader}>{children}</div>;
};

const Card = (props: Props) => {
  const { header, content, contentFooter, children, gradientBorder } = props;

  return (
    <div className={classNames(styles.card, { [styles.gradientBorder]: gradientBorder })}>
      {header}
      {content}
      {contentFooter && <div className={styles.contentFooter}>{contentFooter}</div>}
      {children && <div className={styles.cardChildren}>{children}</div>}
    </div>
  );
};

export default Card;
