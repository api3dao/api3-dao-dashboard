import classNames from 'classnames';
import { ReactNode } from 'react';
import styles from './external-link.module.scss';

interface Props {
  className?: string;
  href: string;
  children: ReactNode;
}

const ExternalLink = (props: Props) => {
  const { className, href, children } = props;

  return (
    <a href={href} className={classNames(className, styles.link)} target="_blank" rel="noopener noreferrer">
      {children}
    </a>
  );
};

export default ExternalLink;
