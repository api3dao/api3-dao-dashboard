import { useHistory } from 'react-router';
import { BaseLayout } from '../../components/layout';
import BorderedBox from '../../components/bordered-box';
import Policies from '../components/policies';
import SearchForm from '../components/search-form';
import { useQueryParams, useScrollToTop } from '../../utils';
import styles from './policy-select.module.scss';

export default function PolicySelect() {
  useScrollToTop();
  const history = useHistory();
  const params = useQueryParams();

  const query = params.get('query') || '';
  const currentPage = parseInt(params.get('page') || '1', 10);

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
      <h5 className={styles.subHeading}>Select a Policy to use in your Claim</h5>
      <div className={styles.formContainer}>
        <SearchForm query={query} placeholder="Search for your policy" onSubmit={handleSubmit} onClear={handleClear} />
      </div>
      <BorderedBox noMobileBorders content={<Policies query={query} filter="active" currentPage={currentPage} />} />
    </BaseLayout>
  );
}
