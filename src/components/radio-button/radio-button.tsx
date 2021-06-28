import { ChangeEventHandler, ReactNode } from 'react';
import classNames from 'classnames';
import { images } from '../../utils';
import styles from './radio-button.module.scss';

type Props = {
  label: ReactNode | string;
  onChange?: ChangeEventHandler<HTMLInputElement>;
  onClick?: () => void;
  checked: boolean;
  name: string;
  color: 'white' | 'pink' | 'green';
  checkbox?: boolean;
};

const RadioButton = ({ label, onChange, onClick, checked, name, color, checkbox }: Props) => {
  return (
    <div className={styles.radioButtonWrapper}>
      <label
        className={classNames(styles.radioButton, {
          [styles.checked]: checked,
          [styles.white]: color === 'white',
          [styles.pink]: color === 'pink',
          [styles.green]: color === 'green',
          [styles.icon]: checkbox,
        })}
      >
        {label}
        <input
          className={styles.radioButtonInput}
          type="radio"
          onClick={onClick}
          onChange={onChange}
          checked={checked}
          name={name}
          readOnly={Boolean(onClick)}
        />
        <span className={classNames(styles.radioButtonCheckmark, { [styles.checkbox]: checkbox })}>
          {checkbox && <img src={images.checkBlack} alt="check icon" />}
        </span>
      </label>
    </div>
  );
};

export default RadioButton;
