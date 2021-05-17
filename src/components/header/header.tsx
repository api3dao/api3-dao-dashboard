import './header.scss';

type Props = {
  sectionTitle: string;
  title: string;
};

const Header = ({ sectionTitle, title }: Props) => {
  return (
    <div className="header">
      <div className="header-subtitle">{sectionTitle}</div>
      <h4>{title}</h4>
      <h1 className="header-title">{sectionTitle}</h1>
    </div>
  );
};

export default Header;
