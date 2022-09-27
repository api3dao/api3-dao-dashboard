import { FormEventHandler } from 'react';
import { useHistory } from 'react-router';
import Layout from '../../components/layout';
import BorderedBox, { Header } from '../../components/bordered-box';
import RadioButton from '../../components/radio-button';
import Policies, { Filter } from '../components/policies';
import SearchForm from '../components/search-form';
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
      <SearchForm query={query} placeholder="Search for your policy" onSubmit={handleSubmit} onClear={handleClear} />
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
