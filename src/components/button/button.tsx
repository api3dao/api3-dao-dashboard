import { ReactNode } from 'react';
import classNames from 'classnames';
import styles from './button.module.scss';

export type Props = {
  children: ReactNode;
  className?: string;
  type?: 'primary' | 'secondary' | 'link' | 'text';
  size?: 'xxs' | 'xs' | 'sm' | 'md' | 'lg' | 'normal' | 'large'; //TODO: remove normal and large
  disabled?: boolean;
  onClick?: () => void;
};

const Button = ({ children, disabled, type = 'primary', size = 'md', onClick, className }: Props) => {
  return (
    <div className={classNames(styles.buttonWrapper, { [styles.disabled]: disabled }, className)}>
      <button className={classNames(styles.button, styles[type], styles[size])} onClick={onClick} disabled={disabled}>
        {children}
      </button>
      {['primary', 'secondary'].includes(type) && (
        <div
          className={classNames({
            [styles.primary]: type === 'primary',
            [styles.secondary]: type === 'secondary',
          })}
        />
      )}
    </div>
  );
};

export default Button;
