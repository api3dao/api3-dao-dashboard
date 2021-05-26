import './header.scss';

type Props = {
  sectionTitle: string;
  title: string;
  subtitle?: string;
};

const Header = ({ sectionTitle, title, subtitle }: Props) => {
  return (
    <div className="header">
      {subtitle && <div className="header-subtitle">{subtitle}</div>}
      <h4>{title}</h4>
      <h1 className="header-title">{sectionTitle}</h1>
    </div>
  );
};

export default Header;
