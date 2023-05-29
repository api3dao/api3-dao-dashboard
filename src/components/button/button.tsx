import { ComponentProps } from 'react';
import classNames from 'classnames';
import styles from './button.module.scss';

export interface Props extends ComponentProps<'button'> {
  variant?: 'primary' | 'secondary' | 'link' | 'text';
  size?: 'normal' | 'large';
}

export default function Button(props: Props) {
  const { className, children, variant = 'primary', size = 'normal', ...rest } = props;

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
      {...rest}
    >
      {children}
    </button>
  );
}
