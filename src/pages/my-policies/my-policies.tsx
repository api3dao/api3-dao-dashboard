import { FormEventHandler } from 'react';
import { useHistory } from 'react-router';
import Layout from '../../components/layout';
import BorderedBox, { Header } from '../../components/bordered-box';
import RadioButton from '../../components/radio-button';
import Input from '../../components/input';
import CloseIcon from '../../components/icons/close-icon';
import SearchIcon from '../../components/icons/search-icon';
import Policies, { Filter } from '../../components/policies';
import { useQueryParams } from '../../utils';
import styles from './my-policies.module.scss';

export default function MyPolicies() {
  const history = useHistory();
  const params = useQueryParams();

  const query = params.get('query') || '';
  const filter = params.get('filter') as Filter;
  const currentPage = parseInt(params.get('page') || '1');

  const handleFilterChange = (showActive: boolean, showInactive: boolean) => {
    const newParams = new URLSearchParams(params);
    // We only want to keep the "query" search param if present
    newParams.delete('filter');
    newParams.delete('page');

    if (showActive && !showInactive) {
      newParams.set('filter', 'active');
    } else if (!showActive && showInactive) {
      newParams.set('filter', 'inactive');
    } else if (!showActive && !showInactive) {
      newParams.set('filter', 'none');
    }

    history.replace('/policies?' + newParams.toString());
  };

  const handleSubmit: FormEventHandler<HTMLFormElement> = (ev) => {
    ev.preventDefault();
    const { value } = ev.currentTarget.query;
    // We don't want to keep any search params
    const newParams = new URLSearchParams();
    newParams.set('query', value.trim());
    history.replace('/policies?' + newParams.toString());
  };

  const handleClear = () => {
    const newParams = new URLSearchParams(params);
    // We only want to keep the "filter" search param if present
    newParams.delete('query');
    newParams.delete('page');
    history.replace('/policies?' + newParams.toString());
  };

  const activeChecked = !filter || filter === 'active';
  const inactiveChecked = !filter || filter === 'inactive';

  return (
    <Layout title="Policies">
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
            <h5>My Policies</h5>
            <div className={styles.filters}>
              <RadioButton
                type="checkbox"
                label="Active"
                checked={activeChecked}
                onChange={() => handleFilterChange(!activeChecked, inactiveChecked)}
                color="white"
              />
              <RadioButton
                type="checkbox"
                label="Inactive"
                checked={inactiveChecked}
                onChange={() => handleFilterChange(activeChecked, !inactiveChecked)}
                color="white"
              />
            </div>
          </Header>
        }
        content={<Policies query={query} filter={filter} currentPage={currentPage} />}
      />
    </Layout>
  );
}
