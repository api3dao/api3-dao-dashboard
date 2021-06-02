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
  textCenter?: boolean;
  largeSpaces?: boolean;
};

export const Header = ({ children, textCenter, largeSpaces }: HeaderProps) => {
  return (
    <div
      className={classNames(styles.borderedBoxHeader, {
        [styles.textCenter]: textCenter,
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
      <div className={`${styles.borderedBoxCol} ${styles.left}`} />
      <div className={classNames(styles.borderedBoxContent, { [styles.borderBottom]: borderBottom })}>
        {header}
        {content}
        {footer && <div className={styles.borderedBoxFooter}>{footer}</div>}
      </div>
      <div className={`${styles.borderedBoxCol} ${styles.right}`} />
    </div>
  );
};

export default BorderedBox;
