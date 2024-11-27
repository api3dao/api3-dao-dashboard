import styles from './header.module.scss';

type Props = {
  title: string;
  subtitle?: string;
};

const Header = ({ title, subtitle }: Props) => {
  return (
    <div className={styles.header}>
      {subtitle && <div className={styles.headerSubtitle}>{subtitle}</div>}
      <h1 className={styles.headerTitle}>{title}</h1>
    </div>
  );
};

export default Header;
