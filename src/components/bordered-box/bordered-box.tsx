import { ReactNode } from 'react';
import classNames from 'classnames';
import styles from './bordered-box.module.scss';

type Props = {
  header: ReactNode;
  content: ReactNode | ReactNode[];
  footer?: ReactNode;
  borderColor?: 'green' | 'grey';
  borderBottom?: boolean;
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

const BorderedBox = ({ header, content, footer, borderColor = 'grey', borderBottom }: Props) => {
  return (
    <div
      className={classNames(styles.borderedBox, {
        [styles.borderGrey]: borderColor === 'grey',
        [styles.borderGreen]: borderColor === 'green',
      })}
    >
      <div className={classNames(styles.borderedBoxCol, styles.left)} />
      <div className={classNames(styles.borderedBoxContent, { [styles.borderBottom]: borderBottom })}>
        {header}
        {content}
        {footer && <div className={styles.borderedBoxFooter}>{footer}</div>}
      </div>
      <div className={classNames(styles.borderedBoxCol, styles.right)} />
    </div>
  );
};

export default BorderedBox;
