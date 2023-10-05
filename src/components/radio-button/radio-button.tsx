import classNames from 'classnames';
import type { ReactNode } from 'react';

import { images } from '../../utils';
import { triggerOnEnter } from '../modal';

import styles from './radio-button.module.scss';

interface Props {
  label: ReactNode | string;
  onChange: () => void;
  checked: boolean;
  type?: 'checkbox' | 'radio';
  color: 'green' | 'pink' | 'white';
}

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
