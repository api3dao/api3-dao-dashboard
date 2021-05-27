import { ReactNode } from 'react';
import classNames from 'classnames';
import './tag.scss';

type Props = {
  children: ReactNode;
  type?: 'primary' | 'secondary';
};

const Tag = ({ children, type = 'primary' }: Props) => <div className={classNames('tag', type)}>{children}</div>;

export default Tag;
