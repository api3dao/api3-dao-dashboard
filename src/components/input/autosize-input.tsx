import { ChangeEventHandler } from 'react';
import classNames from 'classnames';
import AutosizeInput from 'react-input-autosize';
import NumberFormat from 'react-number-format';
import styles from './autosize-input.module.scss';

type Props = {
  onChange: ChangeEventHandler<HTMLInputElement>;
  value: string;
  size?: 'normal' | 'large';
  disabled?: boolean;
  type?: 'text' | 'number';
  placeholder?: string;
  id?: string;
  block?: boolean;
  allowNegative?: boolean;
  autoFocus?: boolean;
};

const Input = ({ size, type = 'text', block, disabled, allowNegative, ...componentProps }: Props) => {
  return (
    <div
      className={classNames(styles.inputWrapper, {
        [styles.disabled]: disabled,
        [styles.block]: block,
      })}
    >
      {type === 'text' && (
        <AutosizeInput
          className={classNames(styles.input, styles.textCenter, {
            [styles.large]: size === 'large',
            [styles.normal]: size === 'normal',
          })}
          {...componentProps}
          placeholderIsMinWidth
        />
      )}
      {type === 'number' && (
        <NumberFormat
          className={classNames(styles.input, styles.textCenter, {
            [styles.large]: size === 'large',
            [styles.normal]: size === 'normal',
          })}
          {...componentProps}
          customInput={AutosizeInput}
          allowNegative={allowNegative || false}
          decimalScale={18}
          placeholderIsMinWidth
          placeholder="00"
        />
      )}
    </div>
  );
};

export default Input;
