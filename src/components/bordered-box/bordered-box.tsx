import { ReactNode } from 'react';
import classNames from 'classnames';
import styles from './bordered-box.module.scss';

type Props = {
  header?: ReactNode;
  content: ReactNode | ReactNode[];
  footer?: ReactNode;
  borderColor?: 'green' | 'grey';
  borderBottom?: boolean;
  noMobileBorders?: boolean;
};

type HeaderProps = {
  children: ReactNode | ReactNode[];
  alignCenter?: boolean;
  largeSpaces?: boolean;
};

export const Header = ({ children, alignCenter, largeSpaces }: HeaderProps) => {
  return (
    <div
      className={classNames(styles.borderedBoxHeader, {
        [styles.alignCenter]: alignCenter,
        [styles.largeSpaces]: largeSpaces,
      })}
    >
      {children}
    </div>
  );
};

const BorderedBox = ({ header, content, footer, borderColor = 'grey', borderBottom, noMobileBorders }: Props) => {
  return (
    <div
      className={classNames(styles.borderedBox, {
        [styles.borderGrey]: borderColor === 'grey',
        [styles.borderGreen]: borderColor === 'green',
      })}
    >
      <div
        className={classNames(styles.borderedBoxCol, styles.left, {
          [styles.noMobileBorders]: noMobileBorders,
        })}
      />
      <div
        className={classNames(styles.borderedBoxContent, {
          [styles.borderBottom]: borderBottom,
          [styles.noMobileBorders]: noMobileBorders,
        })}
      >
        {header}
        {content}
        {footer && <div className={styles.borderedBoxFooter}>{footer}</div>}
      </div>
      <div
        className={classNames(styles.borderedBoxCol, styles.right, {
          [styles.noMobileBorders]: noMobileBorders,
        })}
      />
    </div>
  );
};

export default BorderedBox;
