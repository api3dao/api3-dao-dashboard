import { FormEventHandler } from 'react';
import Input from '../../../components/input';
import SearchIcon from '../../../components/icons/search-icon';
import CloseIcon from '../../../components/icons/close-icon';
import styles from './search-form.module.scss';

interface Props {
  query: string;
  placeholder: string;
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
          aria-label={props.placeholder}
          placeholder={props.placeholder}
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
