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

const Textarea = (props: Props) => {
  return (
    <InputWrapper {...props}>
      <div className={styles.input}>
        <textarea className={styles.input} {...props} />
      </div>
    </InputWrapper>
  );
};

export default Textarea;
