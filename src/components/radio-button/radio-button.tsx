import { ChangeEventHandler, ReactNode } from 'react';
import classNames from 'classnames';
import styles from './radio-button.module.scss';

type Props = {
  label: ReactNode | string;
  onChange: ChangeEventHandler<HTMLInputElement>;
  checked: boolean;
  name: string;
  color: 'white' | 'pink' | 'green';
};

const RadioButton = ({ label, onChange, checked, name, color }: Props) => {
  return (
    <div className={styles.radioButtonWrapper}>
      <label
        className={classNames(styles.radioButton, {
          [styles.checked]: checked,
          [styles.white]: color === 'white',
          [styles.pink]: color === 'pink',
          [styles.green]: color === 'green',
        })}
      >
        {label}
        <input className={styles.radioButtonInput} type="radio" onChange={onChange} checked={checked} name={name} />
        <span className={styles.radioButtonCheckmark} />
      </label>
    </div>
  );
};

export default RadioButton;
