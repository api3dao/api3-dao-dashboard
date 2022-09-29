import { useHistory } from 'react-router';
import { BaseLayout } from '../../components/layout';
import BorderedBox, { Header } from '../../components/bordered-box';
import Policies from '../components/policies';
import SearchForm from '../components/search-form';
import { useQueryParams } from '../../utils';
import styles from './policy-select.module.scss';

export default function PolicySelect() {
  const history = useHistory();
  const params = useQueryParams();

  const query = params.get('query') || '';
  const currentPage = parseInt(params.get('page') || '1');

  const handleSubmit = (value: string) => {
    const newParams = new URLSearchParams();
    newParams.set('query', value.trim());
    history.replace('/claims/new?' + newParams.toString());
  };

  const handleClear = () => {
    history.replace('/claims/new');
  };

  return (
    <BaseLayout subtitle="New Claim">
      <h4 className={styles.heading}>New Claim</h4>
      <SearchForm query={query} placeholder="Search for your policy" onSubmit={handleSubmit} onClear={handleClear} />
      <BorderedBox
        noMobileBorders
        header={
          <Header>
            <h5>Select a Policy to use in your Claim</h5>
          </Header>
        }
        content={<Policies query={query} filter="active" currentPage={currentPage} />}
      />
    </BaseLayout>
  );
}
