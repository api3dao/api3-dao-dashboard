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
  allowNegative?: boolean;
};

const Input = ({
  size = 'normal',
  type = 'text',
  block,
  autosize,
  disabled,
  allowNegative,
  ...componentProps
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
          <input {...componentProps} />
        </div>
      )}
      {type === 'text' && autosize && (
        <AutosizeInput
          className={classNames(styles.input, styles.textCenter, {
            [styles.large]: size === 'large',
            [styles.normal]: size === 'normal',
          })}
          {...componentProps}
          placeholderIsMinWidth
        />
      )}
      {type === 'number' && autosize && (
        <NumberFormat
          className={classNames(styles.input, styles.textCenter, {
            [styles.large]: size === 'large',
            [styles.normal]: size === 'normal',
          })}
          {...componentProps}
          customInput={AutosizeInput}
          allowNegative={allowNegative || false}
          decimalScale={18}
        />
      )}
      {type === 'number' && !autosize && (
        <NumberFormat {...componentProps} customInput={CustomNumberInput} decimalScale={18} />
      )}
      <div className={styles.inputUnderline} />
    </div>
  );
};

export default Input;
