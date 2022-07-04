import { ReactNode } from 'react';
import classNames from 'classnames';
import styles from './button.module.scss';

type Props = {
  children: ReactNode;
  className?: string;
  variant?: 'primary' | 'secondary' | 'link' | 'text';
  size?: 'normal' | 'large';
  disabled?: boolean;
  onClick?: () => void;
};

const Button = ({ children, disabled, variant = 'primary', size = 'normal', onClick, className }: Props) => {
  return (
    <button
      className={classNames(styles.button, className, {
        [styles.primary]: variant === 'primary',
        [styles.secondary]: variant === 'secondary',
        [styles.link]: variant === 'link',
        [styles.text]: variant === 'text',
        [styles.normal]: size === 'normal' && variant !== 'link',
        [styles.large]: size === 'large' && variant !== 'link',
      })}
      onClick={onClick}
      disabled={disabled}
    >
      {children}
    </button>
  );
};

export default Button;
