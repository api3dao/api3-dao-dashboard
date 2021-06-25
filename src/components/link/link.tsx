import { ReactNode } from 'react';

interface Props {
  className?: string;
  href: string;
  children: ReactNode;
}

const Link = (props: Props) => {
  const { className, href, children } = props;

  return (
    <a href={href} className={className} target="_blank" rel="noopener noreferrer">
      {children}
    </a>
  );
};

export default Link;
