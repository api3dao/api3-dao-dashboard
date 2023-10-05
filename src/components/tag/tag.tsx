import classNames from 'classnames';
import type { ReactNode } from 'react';

import styles from './tag.module.scss';

interface Props {
  children: ReactNode;
  type?: 'primary' | 'secondary';
}

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
