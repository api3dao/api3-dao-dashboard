import { ChangeEventHandler } from 'react';
import classNames from 'classnames';
import AutosizeInput from 'react-input-autosize';
import NumberFormat from 'react-number-format';
import styles from './input.module.scss';

type Props = {
  onChange: ChangeEventHandler<HTMLInputElement>;
  value: string;
  size?: 'normal' | 'large';
  disabled?: boolean;
  type?: 'text' | 'autosize-text' | 'number';
  placeholder?: string;
  id?: string;
  block?: boolean;
};

const Input = ({ onChange, value, disabled, size = 'normal', type = 'text', placeholder, id, block }: Props) => (
  <div
    className={classNames(styles.inputWrapper, {
      [styles.disabled]: disabled,
      [styles.block]: block,
    })}
  >
    {type === 'text' && (
      <div
        className={classNames(styles.input, {
          [styles.large]: size === 'large',
          [styles.normal]: size === 'normal',
        })}
      >
        <input id={id} value={value} onChange={onChange} placeholder={placeholder} autoFocus />
      </div>
    )}
    {type === 'autosize-text' && (
      <AutosizeInput
        className={classNames(styles.input, styles.textCenter, {
          [styles.large]: size === 'large',
          [styles.normal]: size === 'normal',
        })}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        autoFocus
        placeholderIsMinWidth
      />
    )}
    {type === 'number' && (
      <NumberFormat
        className={classNames(styles.input, styles.textCenter, {
          [styles.large]: size === 'large',
          [styles.normal]: size === 'normal',
        })}
        value={value}
        onChange={onChange}
        customInput={AutosizeInput}
        decimalScale={18}
        autoFocus
      />
    )}
    <div className={styles.inputUnderline} />
  </div>
);

export default Input;
