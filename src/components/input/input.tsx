import { ChangeEventHandler } from 'react';
import classNames from 'classnames';
import AutosizeInput from 'react-input-autosize';
import NumberFormat from 'react-number-format';
import styles from './input.module.scss';

type Props = {
  onChange: ChangeEventHandler<HTMLInputElement>;
  value: string;
  size?: 'normal' | 'small';
  disabled?: boolean;
  type?: 'text' | 'number';
  placeholder?: string;
  id?: string;
  allowNegative?: boolean;
  autoFocus?: boolean;
};

const Input = ({
  size = 'normal',
  type = 'text',
  disabled,
  allowNegative,
  value,
  placeholder,
  ...componentProps
}: Props) => {
  return (
    <div
      className={classNames(styles.inputWrapper, {
        [styles.disabled]: disabled,
      })}
    >
      {type === 'text' && (
        <AutosizeInput
          className={classNames(styles.input, [styles[size]])}
          {...componentProps}
          placeholder={placeholder}
          placeholderIsMinWidth
          value={value}
        />
      )}
      {type === 'number' && (
        <NumberFormat
          className={classNames(styles.input, [styles[size]])}
          {...componentProps}
          allowNegative={allowNegative || false}
          customInput={AutosizeInput}
          decimalScale={18}
          placeholder={placeholder || '00'}
          placeholderIsMinWidth
          value={value}
        />
      )}
    </div>
  );
};

export default Input;
