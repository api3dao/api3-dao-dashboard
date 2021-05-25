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
  type?: 'text' | 'autosize' | 'number';
  placeholder?: string;
  id?: string;
  block?: boolean;
};

const Input = ({ onChange, value, disabled, size = 'normal', type = 'text', placeholder, id, block }: Props) => (
  <div
    className={classNames('input-wrapper', {
      [`_disabled`]: disabled,
      [`_block`]: block,
    })}
  >
    {type === 'text' && (
      <div
        className={classNames('input', {
          [`_large`]: size === 'large',
          [`_normal`]: size === 'normal',
        })}
      >
        <input id={id} value={value} onChange={onChange} placeholder={placeholder} autoFocus />
      </div>
    )}
    {type === 'autosize' && (
      <AutosizeInput
        className={classNames('input _text-center', {
          [`_large`]: size === 'large',
          [`_normal`]: size === 'normal',
        })}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        autoFocus
        placeholderIsMinWidth
      />
    )}
    {type === 'number' && (
      <NumberFormat
        className={classNames('input _text-center', {
          [`_large`]: size === 'large',
          [`_normal`]: size === 'normal',
        })}
        value={value}
        onChange={onChange}
        customInput={AutosizeInput}
        decimalScale={18}
        autoFocus
      />
    )}
    <div className="input-underline" />
  </div>
);

export default Input;
