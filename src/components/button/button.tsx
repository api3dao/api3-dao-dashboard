import { ReactNode } from 'react';
import classNames from 'classnames';
import styles from './button.module.scss';

type Props = {
  children: ReactNode;
  className?: string;
  btnClassName?: string;
  type?: 'primary' | 'secondary' | 'link' | 'text';
  size?: 'normal' | 'large';
  disabled?: boolean;
  onClick?: () => void;
};

const Button = ({ children, disabled, type = 'primary', size = 'normal', onClick, className, btnClassName }: Props) => {
  return (
    <div className={classNames(styles.buttonWrapper, { [styles.disabled]: disabled }, className)}>
      <button
        className={classNames(
          styles.button,
          {
            [styles.primary]: type === 'primary',
            [styles.secondary]: type === 'secondary',
            [styles.link]: type === 'link',
            [styles.text]: type === 'text',
            [styles.normal]: size === 'normal' && type !== 'link',
            [styles.large]: size === 'large' && type !== 'link',
          },
          btnClassName
        )}
        onClick={onClick}
      >
        {children}
      </button>
      {['primary', 'secondary'].includes(type) && (
        <div
          className={classNames(styles.buttonUnderline, {
            [styles.primary]: type === 'primary',
            [styles.secondary]: type === 'secondary',
          })}
        />
      )}
    </div>
  );
};

export default Button;
