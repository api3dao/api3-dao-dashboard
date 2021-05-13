import { ChangeEventHandler } from 'react';
import classNames from 'classnames';
import AutosizeInput from 'react-input-autosize';
import './input.scss';

type Props = {
  onChange: ChangeEventHandler<HTMLInputElement>;
  value: string;
  size?: 'normal' | 'large';
  disabled?: boolean;
};

const Input = ({ onChange, value, disabled, size = 'normal' }: Props) => {
  return (
    <div className={classNames('input-wrapper', { [`_disabled`]: disabled })}>
      <AutosizeInput
        inputClassName={classNames('input', {
          [`_large`]: size === 'large',
          [`_normal`]: size === 'normal',
        })}
        value={value}
        onChange={onChange}
        disabled={disabled}
      />
      <div className="input-underline" />
    </div>
  );
};

export default Input;
