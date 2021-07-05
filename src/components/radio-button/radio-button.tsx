import { ChangeEventHandler, ReactNode } from 'react';
import classNames from 'classnames';
import { images } from '../../utils';
import styles from './radio-button.module.scss';

type Props = {
  label: ReactNode | string;
  onChange?: ChangeEventHandler<HTMLInputElement>;
  checked: boolean;
  name: string;
  type?: 'radio' | 'checkbox';
  color: 'white' | 'pink' | 'green';
};

const RadioButton = ({ label, onChange, type = 'radio', checked, name, color }: Props) => {
  return (
    <div className={styles.radioButtonWrapper}>
      <label
        className={classNames(styles.radioButton, {
          [styles.checked]: checked,
          [styles.white]: color === 'white',
          [styles.pink]: color === 'pink',
          [styles.green]: color === 'green',
          [styles.icon]: type === 'checkbox',
        })}
      >
        {label}
        <input className={styles.radioButtonInput} type={type} onChange={onChange} checked={checked} name={name} />
        <span className={classNames(styles.radioButtonCheckmark, { [styles.checkbox]: type === 'checkbox' })}>
          {type === 'checkbox' && <img src={images.checkBlack} alt="check icon" />}
        </span>
      </label>
    </div>
  );
};

export default RadioButton;
