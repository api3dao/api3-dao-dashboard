import { ReactNode, useState } from 'react';
import styles from './tooltip.module.scss';

type Props = {
  children: ReactNode;
  content: string | ReactNode;
};

const Tooltip = ({ children, content }: Props) => {
  const [hover, setHover] = useState(false);

  return (
    <span className={styles.tooltipWrapper} onMouseEnter={() => setHover(true)} onMouseLeave={() => setHover(false)}>
      {children}
      {hover && <div className={styles.tooltip}>{content}</div>}
    </span>
  );
};

export default Tooltip;
