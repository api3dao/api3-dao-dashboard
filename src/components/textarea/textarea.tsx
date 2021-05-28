import { ChangeEventHandler } from 'react';
import './textarea.scss';

type Props = {
  onChange: ChangeEventHandler<HTMLTextAreaElement>;
  value: string;
  placeholder?: string;
  id?: string;
  block?: boolean;
};

const Textarea = ({ onChange, value, placeholder, id, block }: Props) => (
  <textarea className="textarea" id={id} placeholder={placeholder} value={value} onChange={onChange} />
);

export default Textarea;
