import styles from './header.module.scss';

type Props = {
  title: string;
  subtitle?: string;
};

const Header = ({ title, subtitle }: Props) => {
  return (
    <div className={styles.header}>
      {subtitle && <div className={styles.headerSubtitle}>{subtitle}</div>}
      <p aria-hidden className={styles.headerTitle}>
        {title}
      </p>
      <h1 className={styles.headerLargeTitle}>{title}</h1>
    </div>
  );
};

export default Header;
