import { ChangeEventHandler, ReactNode } from 'react';
import { CrossIcon } from '../icons';
import classNames from 'classnames';
import styles from './form.module.scss';

interface Props {
  children: ReactNode;
  error?: boolean;
  helperText?: string;
  value: string;
  onChange: ChangeEventHandler<HTMLInputElement | HTMLTextAreaElement>;
}

export const InputWrapper = (props: Props) => {
  const { children, value, helperText, error, onChange } = props;

  const clearInput = () => {
    onChange({ target: { value: '' } } as any);
  };

  return (
    <div className={styles.inputWrapper}>
      <div className={classNames(styles.container, { [styles.error]: error })}>
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
