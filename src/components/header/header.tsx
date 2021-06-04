import styles from './header.module.scss';

type Props = {
  sectionTitle: string;
  title: string;
  subtitle?: string;
};

const Header = ({ sectionTitle, title, subtitle }: Props) => {
  return (
    <div className={styles.header}>
      {subtitle && <div className={styles.headerSubtitle}>{subtitle}</div>}
      <h4>{title}</h4>
      <h1 className={styles.headerTitle}>{sectionTitle}</h1>
    </div>
  );
};

export default Header;
