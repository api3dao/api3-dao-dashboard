import { ChangeEventHandler, useCallback } from 'react';
import classNames from 'classnames';
import AutosizeInput from 'react-input-autosize';
import NumberFormat from 'react-number-format';
import styles from './input.module.scss';

type Props = {
  onChange: ChangeEventHandler<HTMLInputElement>;
  value: string;
  size?: 'normal' | 'large';
  disabled?: boolean;
  type?: 'text' | 'number';
  autosize?: boolean;
  placeholder?: string;
  id?: string;
  block?: boolean;
  autoFocus?: boolean;
};

const Input = ({
  onChange,
  value,
  disabled,
  size = 'normal',
  type = 'text',
  placeholder,
  id,
  block,
  autosize,
  autoFocus,
}: Props) => {
  const CustomNumberInput = useCallback(
    (props: any) => {
      return (
        <div
          className={classNames(styles.input, {
            [styles.large]: size === 'large',
            [styles.normal]: size === 'normal',
          })}
        >
          <input {...props} />
        </div>
      );
    },
    [size]
  );

  return (
    <div
      className={classNames(styles.inputWrapper, {
        [styles.disabled]: disabled,
        [styles.block]: block,
      })}
    >
      {type === 'text' && !autosize && (
        <div
          className={classNames(styles.input, {
            [styles.large]: size === 'large',
            [styles.normal]: size === 'normal',
          })}
        >
          <input id={id} value={value} onChange={onChange} placeholder={placeholder} autoFocus={autoFocus} />
        </div>
      )}
      {type === 'text' && autosize && (
        <AutosizeInput
          className={classNames(styles.input, styles.textCenter, {
            [styles.large]: size === 'large',
            [styles.normal]: size === 'normal',
          })}
          value={value}
          onChange={onChange}
          placeholder={placeholder}
          autoFocus={autoFocus}
          placeholderIsMinWidth
        />
      )}
      {type === 'number' && autosize && (
        <NumberFormat
          className={classNames(styles.input, styles.textCenter, {
            [styles.large]: size === 'large',
            [styles.normal]: size === 'normal',
          })}
          value={value}
          onChange={onChange}
          customInput={AutosizeInput}
          decimalScale={18}
          autoFocus={autoFocus}
        />
      )}
      {type === 'number' && !autosize && (
        <NumberFormat
          value={value}
          onChange={onChange}
          customInput={CustomNumberInput}
          decimalScale={18}
          autoFocus={autoFocus}
        />
      )}
      <div className={styles.inputUnderline} />
    </div>
  );
};

export default Input;
