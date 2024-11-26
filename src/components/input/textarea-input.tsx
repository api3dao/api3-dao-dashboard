import { ChangeEventHandler, ReactNode, useCallback } from 'react';
import NumberFormat from 'react-number-format';
import styles from './textarea-input.module.scss';
import { CrossIcon } from '../icons';
import classNames from 'classnames';

interface InputProps {
  autoFocus?: boolean;
  multiline?: false;
  type?: 'text' | 'number';
}

interface MultilineInputProps {
  type?: 'text';
  multiline?: true;
}

type Props = {
  id: string;
  helperText?: string;
  error?: boolean;
  placeholder?: string;
  value: string;
  onChange: ChangeEventHandler<HTMLInputElement>;
} & (InputProps | MultilineInputProps);

const Input = ({ type = 'text', multiline, ...componentProps }: Props) => {
  const CustomNumberInput = useCallback((props: any) => {
    return (
      <div className={styles.input}>
        <input {...props} />
      </div>
    );
  }, []);

  if (multiline) {
    return (
      <InputWrapper {...componentProps}>
        <div className={styles.input}>
          <textarea className={styles.input} {...(componentProps as MultilineInputProps)} />
        </div>
      </InputWrapper>
    );
  }

  if (type === 'number') {
    return (
      <InputWrapper {...componentProps}>
        <NumberFormat {...componentProps} customInput={CustomNumberInput} decimalScale={18} />
      </InputWrapper>
    );
  }

  return (
    <InputWrapper {...componentProps}>
      <div className={styles.input}>
        <input {...componentProps} />
      </div>
    </InputWrapper>
  );
};

interface InputWrapperProps extends Pick<Props, 'value' | 'helperText' | 'error' | 'onChange'> {
  children: ReactNode;
}

const InputWrapper = (props: InputWrapperProps) => {
  const { children, value, helperText, error, onChange } = props;

  const clearInput = () => {
    onChange({ target: { value: '' } } as any);
  };

  return (
    <div className={styles.inputWrapper}>
      <div className={styles.container}>
        {children}

        <button className={styles.clearButton} disabled={!value} onClick={clearInput}>
          <CrossIcon />
          <span className="sr-only">Clear input</span>
        </button>
      </div>

      {helperText && <span className={classNames(styles.helperText, { [styles.error]: error })}>{helperText}</span>}
    </div>
  );
};

export default Input;
