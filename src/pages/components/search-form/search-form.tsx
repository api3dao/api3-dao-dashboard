import { FormEventHandler, useRef } from 'react';
import SearchIcon from '../../../components/icons/search-icon';
import CloseIcon from '../../../components/icons/close-icon';
import styles from './search-form.module.scss';

interface Props {
  query: string;
  onSubmit: (query: string) => void;
  onClear: () => void;
  placeholder: string;
}

export default function SearchForm(props: Props) {
  const { query } = props;
  const inputRef = useRef<HTMLInputElement>(null);

  const handleSubmit: FormEventHandler<HTMLFormElement> = (ev) => {
    ev.preventDefault();
    const { value } = ev.currentTarget.query;
    props.onSubmit(value);
  };

  return (
    <form className={styles.searchForm} onSubmit={handleSubmit}>
      <input
        ref={inputRef}
        key={query}
        name="query"
        defaultValue={query}
        aria-label={props.placeholder}
        placeholder={props.placeholder}
      />
      <button type="submit" className={styles.searchButton}>
        <SearchIcon aria-hidden />
        <span className="sr-only">Submit</span>
      </button>
      {query && (
        <button
          tabIndex={-1}
          type="button"
          className={styles.clearButton}
          onClick={() => {
            props.onClear();
            setTimeout(() => inputRef.current?.focus(), 0);
          }}
        >
          <CloseIcon aria-hidden />
          <span className="sr-only">Clear</span>
        </button>
      )}
    </form>
  );
}
