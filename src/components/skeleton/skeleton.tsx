import { ComponentProps, CSSProperties } from 'react';
import classNames from 'classnames';
import styles from './skeleton.module.scss';

interface Props extends ComponentProps<'div'> {
  width?: CSSProperties['width'];
}

export default function Skeleton(props: Props) {
  const { width, style, className, children, ...rest } = props;

  return (
    <div style={{ ...style, width }} className={classNames(styles.skeleton, className)} {...rest}>
      &zwnj;{children}
    </div>
  );
}
