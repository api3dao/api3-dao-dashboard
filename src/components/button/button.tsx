import { ReactNode } from 'react';
import classNames from 'classnames';
import styles from './button.module.scss';
import { BreakpointKeys, breakpoints, useWindowDimensions } from '../../hooks/use-window-dimensions';

export type Size = 'xxs' | 'xs' | 'sm' | 'md' | 'lg' | 'normal' | 'large'; //TODO: remove normal and large after rebranding is done;

type BreakpointsProps = { [key in BreakpointKeys]?: { size?: Size } };

export interface Props extends BreakpointsProps {
  children: ReactNode;
  className?: string;
  type?: 'primary' | 'secondary' | 'secondary-neutral' | 'link' | 'text' | 'menu-link-secondary' | 'link-blue';
  size?: Size;
  disabled?: boolean;
  href?: string;
  theme?: 'light' | 'dark';
  onClick?: () => void;
  'data-testid'?: string;
}

const Button = ({
  children,
  disabled,
  type = 'primary',
  size = 'md',
  onClick,
  className,
  href,
  theme = 'light',
  xs,
  sm,
  md,
  lg,
  ...rest
}: Props) => {
  const { width } = useWindowDimensions();
  const sizeClass = getSizeClass(width, size, { xs, sm, md, lg });

  return href ? (
    <a
      href={href}
      className={classNames(
        'button',
        styles.button,
        styles[type],
        styles[theme],
        styles[sizeClass],
        { [styles.disabled]: disabled },
        className
      )}
      {...(isExternal(href) ? { target: '_blank', rel: 'noopener noreferrer' } : {})}
      {...rest}
    >
      {children}
    </a>
  ) : (
    <button
      className={classNames(
        'button',
        styles.button,
        styles[type],
        styles[theme],
        styles[sizeClass],
        { [styles.disabled]: disabled },
        className
      )}
      onClick={onClick}
      disabled={disabled}
      {...rest}
    >
      {children}
    </button>
  );
};

const getSizeClass = (width: number, size?: Size, sizeProps?: BreakpointsProps) => {
  let sizeClass: Size | undefined;

  const { xs, sm, md, lg } = sizeProps || {};

  if (width >= breakpoints.lg) {
    sizeClass = lg?.size || md?.size || sm?.size || xs?.size;
  }
  if (width < breakpoints.lg) {
    sizeClass = md?.size || sm?.size || xs?.size;
  }
  if (width < breakpoints.md) {
    sizeClass = sm?.size || xs?.size;
  }
  if (width < breakpoints.sm) {
    sizeClass = xs?.size;
  }

  return sizeClass || size || '';
};

export const isExternal = (link: string) => {
  const urlRegex = /^https?:\/\//i;
  return urlRegex.test(link);
};

export default Button;
