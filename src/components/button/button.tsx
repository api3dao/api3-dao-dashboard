import { ReactNode } from 'react';
import classNames from 'classnames';
import styles from './button.module.scss';
import { BreakpointKeys, breakpoints, useWindowDimensions } from '../../hooks/use-window-dimensions';

export type Size = 'xxs' | 'xs' | 'sm' | 'md' | 'lg' | 'normal' | 'large'; //TODO: remove normal and large after rebranding is done;

type BreakpointsProps = { [key in BreakpointKeys]?: { size?: Size } };

export interface Props extends BreakpointsProps {
  children: ReactNode;
  className?: string;
  type?: 'primary' | 'secondary' | 'link' | 'text' | 'menu-link-secondary';
  size?: Size;
  disabled?: boolean;
  href?: string;
  theme?: 'light' | 'dark';
  onClick?: () => void;
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
}: Props) => {
  const { width } = useWindowDimensions();
  const sizeClass = getSizeClass(width, size, { xs, sm, md, lg });

  return (
    <div className={classNames(styles.buttonWrapper, { [styles.disabled]: disabled }, className)}>
      {href ? (
        <a
          href={href}
          className={classNames(styles.button, styles[type], styles[theme], styles[sizeClass])}
          {...(isExternal(href) ? { target: '_blank', rel: 'noopener noreferrer' } : {})}
        >
          {children}
        </a>
      ) : (
        <button
          className={classNames(styles.button, styles[type], styles[theme], styles[sizeClass])}
          onClick={onClick}
          disabled={disabled}
        >
          {children}
        </button>
      )}
    </div>
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
