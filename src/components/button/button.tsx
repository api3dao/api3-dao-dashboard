import React, { ReactNode } from 'react';
import classNames from 'classnames';
import './button.scss';

type Props = {
  children: ReactNode;
  type?: 'primary' | 'secondary';
  size?: 'normal' | 'large';
  disabled?: boolean;
  onClick?: () => void;
};

const Button = ({ children, disabled, type = 'primary', size = 'normal', onClick }: Props) => {
  return (
    <div className={classNames('button-wrapper', { [`_disabled`]: disabled })}>
      <button
        className={classNames('button', {
          [`_primary`]: type === 'primary',
          [`_secondary`]: type === 'secondary',
          [`_normal`]: size === 'normal',
          [`_large`]: size === 'large',
        })}
        onClick={onClick}
      >
        {children}
      </button>
      <div
        className={classNames('button-underline', {
          [`_primary`]: type === 'primary',
          [`_secondary`]: type === 'secondary',
        })}
      />
    </div>
  );
};

export default Button;
