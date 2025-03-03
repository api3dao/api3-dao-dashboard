import { ChangeEventHandler } from 'react';
import { InputWrapper } from './input-wrapper';
import styles from './form.module.scss';

type Props = {
  id: string;
  helperText?: string;
  error?: boolean;
  placeholder?: string;
  value: string;
  onChange: ChangeEventHandler<HTMLTextAreaElement>;
};

const Textarea = ({ helperText, error, ...textAreaProps }: Props) => {
  return (
    <InputWrapper helperText={helperText} error={error} {...textAreaProps}>
      <div className={styles.input}>
        <textarea className={styles.input} {...textAreaProps} />
      </div>
    </InputWrapper>
  );
};

export default Textarea;
