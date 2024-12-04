import { KeyboardEvent, ReactNode } from 'react';
import { CheckIcon } from '../icons';
import styles from './checkbox.module.scss';

interface Props {
  label?: string;
  checked: boolean;
  children?: ReactNode;
  disabled?: boolean;
  onChange: (checked: boolean) => void;
}

const CheckBox = ({ label, checked, children, disabled, onChange }: Props) => {
  const handleKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      onChange(!checked);
    }
  };

  return (
    <div
      id={label}
      className={styles.checkbox}
      tabIndex={0}
      role="checkbox"
      aria-checked={checked}
      aria-disabled={disabled}
      onClick={() => {
        onChange(!checked);
      }}
      onKeyDown={handleKeyDown}
    >
      <span className={styles.checkmark}>{checked && <CheckIcon />}</span>

      <div className={styles.checkboxTextBlock}>
        <label htmlFor={label}>{label}</label>
        {children && <div className={styles.description}>{children}</div>}
      </div>
    </div>
  );
};

export default CheckBox;
