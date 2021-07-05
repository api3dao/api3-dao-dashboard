import { ReactElement } from 'react';
import Tooltip from './tooltip';
import { images } from '../../utils';
import styles from './tooltip.module.scss';

interface Props {
  children: ReactElement;
  items: {
    checked: boolean;
    label: ReactElement | string;
  }[];
}

const TooltipChecklist = ({ children, items }: Props) => {
  const content = (
    <div className={styles.tooltipChecklist}>
      {items.map((item, i) => (
        <div key={i} className={styles.tooltipItem}>
          <img
            src={item.checked ? images.checkboxFilled : images.checkboxEmpty}
            alt={item.checked ? 'checked' : 'unchecked'}
          />
          <div className={item.checked ? styles.labelChecked : styles.labelUnchecked}>{item.label}</div>
        </div>
      ))}
    </div>
  );

  return <Tooltip overlay={content}>{children}</Tooltip>;
};

export default TooltipChecklist;
