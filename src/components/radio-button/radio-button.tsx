import { ReactNode } from 'react';
import classNames from 'classnames';
import styles from './radio-button.module.scss';
import { triggerOnEnter } from '../modal';
import { CheckboxRadioIcon, CheckCircleFillIcon, RadioButtonFillIcon, RadioButtonIcon } from '../icons';

type Radio = { type: 'radio'; size?: 'default'; color?: undefined };
type RadioLarge = { type?: 'radio'; size: 'large'; color?: 'default' | 'success' | 'warning' };
type Checkbox = { type?: 'checkbox'; size?: 'default'; color?: undefined };

type Props = {
  checked: boolean;
  children: ReactNode;
  name?: string;
  onChange: () => void;
} & (Radio | RadioLarge | Checkbox);

const RadioButton = (props: Props) => {
  const { checked, children, name, type = 'radio', size = 'default', color = 'default', onChange } = props;

  if (size === 'large') {
    return (
      <div role={type} aria-checked={checked} tabIndex={0} onKeyDown={triggerOnEnter(onChange)}>
        <label
          className={classNames(styles.radioButtonLabel, styles.radioButtonLabelLarge, [styles[color]], {
            [styles.checked]: checked,
          })}
        >
          {children}

          <input
            className={styles.radioButtonInput}
            type={type}
            name={name}
            tabIndex={-1}
            onChange={onChange}
            checked={checked}
          />

          <span className={classNames(styles.radioButtonIcon, styles.radioButtonCircle, [styles[color]])}>
            {checked ? <RadioButtonFillIcon /> : <RadioButtonIcon />}
          </span>
        </label>
      </div>
    );
  }

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

        <span className={styles.radioButtonIcon}>{checked ? <CheckCircleFillIcon /> : <CheckboxRadioIcon />}</span>
      </label>
    </div>
  );
};

export default RadioButton;
