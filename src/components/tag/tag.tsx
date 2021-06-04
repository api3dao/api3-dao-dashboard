import { ReactNode } from 'react';
import classNames from 'classnames';
import styles from './tag.module.scss';

type Props = {
  children: ReactNode;
  type?: 'primary' | 'secondary';
};

const Tag = ({ children, type = 'primary' }: Props) => (
  <div
    className={classNames(styles.tag, {
      [styles.primary]: type === 'primary',
      [styles.secondary]: type === 'secondary',
    })}
  >
    {children}
  </div>
);

export default Tag;
