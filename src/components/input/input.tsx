import { ChangeEventHandler } from 'react';
import classNames from 'classnames';
import AutosizeInput from 'react-input-autosize';
import NumberFormat from 'react-number-format';
import './input.scss';

type Props = {
  onChange: ChangeEventHandler<HTMLInputElement>;
  value: string;
  size?: 'normal' | 'large';
  disabled?: boolean;
};

const Input = ({ onChange, value, disabled, size = 'normal' }: Props) => (
  <div className={classNames('input-wrapper', { [`_disabled`]: disabled })}>
    <NumberFormat
      className={classNames('input', {
        [`_large`]: size === 'large',
        [`_normal`]: size === 'normal',
      })}
      value={value}
      onChange={onChange}
      customInput={AutosizeInput}
      decimalScale={18}
      autoFocus
    />
    <div className="input-underline" />
  </div>
);

export default Input;
