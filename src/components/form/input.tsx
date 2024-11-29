import { ChangeEventHandler, useCallback } from 'react';
import NumberFormat from 'react-number-format';
import { InputWrapper } from './input-wrapper';
import styles from './form.module.scss';

type Props = {
  autoFocus?: boolean;
  id: string;
  helperText?: string;
  error?: boolean;
  placeholder?: string;
  type?: 'text' | 'number';
  value: string;
  onChange: ChangeEventHandler<HTMLInputElement>;
};

const Input = ({ type = 'text', ...componentProps }: Props) => {
  const CustomNumberInput = useCallback((props: any) => {
    return (
      <div className={styles.input}>
        <input {...props} />
      </div>
    );
  }, []);

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

export default Input;
