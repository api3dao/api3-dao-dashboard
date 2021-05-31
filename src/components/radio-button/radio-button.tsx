import { ChangeEventHandler, ReactNode } from 'react';
import classNames from 'classnames';
import './radio-button.scss';

type Props = {
  label: ReactNode | string;
  onChange: ChangeEventHandler<HTMLInputElement>;
  checked: boolean;
  name: string;
  color: 'white' | 'pink' | 'green';
};

const RadioButton = ({ label, onChange, checked, name, color }: Props) => {
  return (
    <div className="radio-button-wrapper">
      <label className={classNames('radio-button', color, { [`checked`]: checked })}>
        {label}
        <input className="radio-button-input" type="radio" onChange={onChange} checked={checked} name={name} />
        <span className="radio-button-checkmark" />
      </label>
    </div>
  );
};

export default RadioButton;
