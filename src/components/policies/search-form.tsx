import { FormEventHandler } from 'react';
import Input from '../input';
import SearchIcon from '../icons/search-icon';
import CloseIcon from '../icons/close-icon';
import styles from './search-form.module.scss';

interface Props {
  query: string;
  onSubmit: FormEventHandler<HTMLFormElement>;
  onClear: () => void;
}

export default function SearchForm(props: Props) {
  const { query } = props;

  return (
    <form className={styles.searchForm} onSubmit={props.onSubmit}>
      <div className={styles.inputContainer}>
        <Input
          key={query}
          name="query"
          defaultValue={query}
          aria-label="Search for your policy"
          placeholder="Search for your policy"
          underline={false}
          block
        />
      </div>
      <button type="submit" className={styles.searchButton}>
        <SearchIcon aria-hidden />
        <span className="sr-only">Submit</span>
      </button>
      {query && (
        <button tabIndex={-1} type="button" className={styles.clearButton} onClick={props.onClear}>
          <CloseIcon aria-hidden />
          <span className="sr-only">Clear</span>
        </button>
      )}
    </form>
  );
}