import { FormEventHandler } from 'react';
import { useHistory } from 'react-router';
import Layout from '../../components/layout';
import BorderedBox, { Header } from '../../components/bordered-box';
import Input from '../../components/input';
import CloseIcon from '../../components/icons/close-icon';
import SearchIcon from '../../components/icons/search-icon';
import { useQueryParams } from '../../utils';
import styles from './policy-select.module.scss';
import Policies from '../../components/policies';

export default function PolicySelect() {
  const history = useHistory();
  const params = useQueryParams();

  const query = params.get('query') || '';
  const currentPage = parseInt(params.get('page') || '1');

  const handleSubmit: FormEventHandler<HTMLFormElement> = (ev) => {
    ev.preventDefault();
    const { value } = ev.currentTarget.query;
    const newParams = new URLSearchParams();
    newParams.set('query', value.trim());
    history.replace('/claims/new?' + newParams.toString());
  };

  const handleClear = () => {
    history.replace('/claims/new');
  };

  return (
    <Layout title="New Claim">
      <form className={styles.searchForm} onSubmit={handleSubmit}>
        <div className={styles.inputContainer}>
          <Input
            key={query}
            name="query"
            defaultValue={query}
            aria-label="Search your policies"
            placeholder="Search your policies"
            underline={false}
            block
          />
        </div>
        <button type="submit" className={styles.searchButton}>
          <SearchIcon aria-hidden />
          <span className="sr-only">Submit</span>
        </button>
        {query && (
          <button tabIndex={-1} type="button" className={styles.clearButton} onClick={handleClear}>
            <CloseIcon aria-hidden />
            <span className="sr-only">Clear</span>
          </button>
        )}
      </form>
      <BorderedBox
        noMobileBorders
        header={
          <Header>
            <h5>Select a Policy to use in your Claim</h5>
          </Header>
        }
        content={<Policies query={query} filter="active" currentPage={currentPage} />}
      />
    </Layout>
  );
}
