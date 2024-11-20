import { ReactElement } from 'react';
import Tooltip from './tooltip';
import { images } from '../../utils';
import styles from './tooltip-checklist.module.scss';
import classNames from 'classnames';

interface Props {
  children: ReactElement;
  items: {
    checked: boolean;
    label: ReactElement | string;
  }[];
}

const TooltipChecklist = ({ children, items }: Props) => {
  const content = (
    <ul className={styles.tooltipChecklist}>
      {items.map((item, i) => (
        <li key={i} className={classNames(styles.checklistItem, { [styles.unchecked]: !item.checked })}>
          <img
            src={item.checked ? images.checkboxFilled : images.checkboxEmpty}
            alt={item.checked ? 'checked' : 'unchecked'}
          />
          <span>{item.label}</span>
        </li>
      ))}
    </ul>
  );

  return (
    <Tooltip overlay={content} type="items">
      {children}
    </Tooltip>
  );
};

export default TooltipChecklist;
