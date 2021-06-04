import { ChangeEventHandler } from 'react';
import styles from './textarea.module.scss';

type Props = {
  onChange: ChangeEventHandler<HTMLTextAreaElement>;
  value: string;
  placeholder?: string;
  id?: string;
};

const Textarea = ({ onChange, value, placeholder, id }: Props) => (
  <textarea className={styles.textarea} id={id} placeholder={placeholder} value={value} onChange={onChange} />
);

export default Textarea;
