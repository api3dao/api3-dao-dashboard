import { ReactNode } from 'react';
import classNames from 'classnames';
import { images } from '../../utils';
import styles from './radio-button.module.scss';
import { triggerOnEnter } from '../modal';

type Props = {
  label: ReactNode | string;
  onChange: () => void;
  checked: boolean;
  type?: 'radio' | 'checkbox';
  color: 'white' | 'pink' | 'green';
};

const RadioButton = ({ label, onChange, type = 'radio', checked, color }: Props) => {
  return (
    <div className={styles.radioButtonWrapper} tabIndex={0} onKeyPress={triggerOnEnter(onChange)}>
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
        <input tabIndex={-1} className={styles.radioButtonInput} type={type} onChange={onChange} checked={checked} />
        <span className={classNames(styles.radioButtonCheckmark, { [styles.checkbox]: type === 'checkbox' })}>
          {type === 'checkbox' && <img src={images.checkBlack} alt="check icon" />}
        </span>
      </label>
    </div>
  );
};

export default RadioButton;
