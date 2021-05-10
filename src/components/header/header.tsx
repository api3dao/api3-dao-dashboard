import './header.scss';

type Props = {
  title: string;
  subtitle: string;
};

const Header = ({ title, subtitle }: Props) => {
  return (
    <div className="header">
      <div className="header-subtitle">{subtitle}</div>
      <h4>{title}</h4>
      <h1 className="header-title">{title}</h1>
    </div>
  );
};

export default Header;
