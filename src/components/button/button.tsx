import { ReactNode } from 'react';
import classNames from 'classnames';
import styles from './button.module.scss';

type Props = {
  children: ReactNode;
  className?: string;
  type?: 'primary' | 'secondary' | 'link' | 'text';
  size?: 'normal' | 'large';
  disabled?: boolean;
  onClick?: () => void;
};

const Button = ({ children, disabled, type = 'primary', size = 'normal', onClick, className }: Props) => {
  return (
    <button
      className={classNames(styles.button, className, {
        [styles.primary]: type === 'primary',
        [styles.secondary]: type === 'secondary',
        [styles.link]: type === 'link',
        [styles.text]: type === 'text',
        [styles.normal]: size === 'normal' && type !== 'link',
        [styles.large]: size === 'large' && type !== 'link',
      })}
      onClick={onClick}
      disabled={disabled}
    >
      {children}
    </button>
  );
};

export default Button;
