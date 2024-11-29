import { ReactNode } from 'react';
import classNames from 'classnames';
import styles from './radio-button.module.scss';
import { triggerOnEnter } from '../modal';
import { CheckboxRadioIcon, CheckCircleFillIcon } from '../icons';

type Props = {
  checked: boolean;
  children: ReactNode;
  name?: string;
  type?: 'radio' | 'checkbox';
  onChange: () => void;
};

const RadioButton = (props: Props) => {
  const { checked, children, name, type = 'radio', onChange } = props;

  return (
    <div role={type} aria-checked={checked} tabIndex={0} onKeyDown={triggerOnEnter(onChange)}>
      <label className={classNames(styles.radioButtonLabel, { [styles.checked]: checked })}>
        {children}

        <input
          className={styles.radioButtonInput}
          type={type}
          name={name}
          tabIndex={-1}
          onChange={onChange}
          checked={checked}
        />

        <span className={styles.radioButtonCheckmark}>{checked ? <CheckCircleFillIcon /> : <CheckboxRadioIcon />}</span>
      </label>
    </div>
  );
};

export default RadioButton;
