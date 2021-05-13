import React, { ReactNode } from 'react';
import classNames from 'classnames';
import './button.scss';

type Props = {
  children: ReactNode;
  className?: string;
  type?: 'primary' | 'secondary' | 'link';
  size?: 'normal' | 'large';
  disabled?: boolean;
  onClick?: () => void;
};

const Button = ({ children, disabled, type = 'primary', size = 'normal', onClick, className }: Props) => {
  return (
    <div className={classNames('button-wrapper', { [`_disabled`]: disabled }, className)}>
      <button
        className={classNames('button', {
          [`_primary`]: type === 'primary',
          [`_secondary`]: type === 'secondary',
          [`_link`]: type === 'link',
          [`_normal`]: size === 'normal' && type !== 'link',
          [`_large`]: size === 'large' && type !== 'link',
        })}
        onClick={onClick}
      >
        {children}
      </button>
      {type !== 'link' && (
        <div
          className={classNames('button-underline', {
            [`_primary`]: type === 'primary',
            [`_secondary`]: type === 'secondary',
          })}
        />
      )}
    </div>
  );
};

export default Button;
