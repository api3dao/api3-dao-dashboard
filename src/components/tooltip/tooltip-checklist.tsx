import { ReactNode } from 'react';
import Tooltip from './tooltip';
import { images } from '../../utils';
import styles from './tooltip.module.scss';

interface Props {
  children: ReactNode;
  items: {
    alt: string;
    checked: boolean;
    label: string;
  }[];
}

const TooltipChecklist = ({ children, items }: Props) => {
  const content = (
    <div className={styles.tooltipChecklist}>
      {items.map((item, i) => (
        <div key={i} className={styles.tooltipItem}>
          <img src={item.checked ? images.checkboxFilled : images.checkboxEmpty} alt={item.alt} />
          <span>{item.label}</span>
        </div>
      ))}
    </div>
  );

  return <Tooltip content={content}>{children}</Tooltip>;
};

export default TooltipChecklist;
