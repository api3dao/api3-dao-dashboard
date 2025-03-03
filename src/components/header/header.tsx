import styles from './header.module.scss';

type Props = {
  title: string;
};

const Header = ({ title }: Props) => {
  return (
    <div className={styles.header}>
      <h1 className={styles.headerTitle}>{title}</h1>
    </div>
  );
};

export default Header;
