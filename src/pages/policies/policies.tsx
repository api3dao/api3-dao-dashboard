import { FormEventHandler, ReactNode, useMemo } from 'react';
import { useHistory } from 'react-router';
import Layout from '../../components/layout';
import BorderedBox, { Header } from '../../components/bordered-box';
import RadioButton from '../../components/radio-button';
import Button from '../../components/button';
import Input from '../../components/input';
import CloseIcon from '../../components/icons/close-icon';
import SearchIcon from '../../components/icons/search-icon';
import PolicyList from './policy-list';
import Pagination, { usePagedData } from './pagination';
import { useQueryParams } from '../../utils';
import { connectWallet } from '../../components/sign-in/sign-in';
import { useChainData } from '../../chain-data';
import { useUserPolicies, isActive } from '../../logic/policies';
import styles from './policies.module.scss';

export default function Policies() {
  const { data: policies, status } = useUserPolicies();

  const params = useQueryParams();
  const query = params.get('query');
  const filter = params.get('filter');
  const currentPage = parseInt(params.get('page') || '1');

  const filteredPolicies = useMemo(() => {
    if (!policies || filter === 'none') return [];

    const results = query
      ? policies.filter((policy) => policy.ipfsHash.toLowerCase().includes(query.toLowerCase()))
      : policies;

    switch (filter) {
      case 'active':
        return results.filter((policy) => isActive(policy));
      case 'inactive':
        return results.filter((policy) => !isActive(policy));
      default:
        return results;
    }
  }, [policies, query, filter]);

  const pagedPolicies = usePagedData(filteredPolicies, { currentPage });

  const { provider, setChainData } = useChainData();
  if (!provider) {
    return (
      <PoliciesLayout>
        <div className={styles.emptyState}>
          You need to be connected to view your policies.
          <Button type="link" onClick={connectWallet(setChainData)} className={styles.connectButton}>
            Connect your wallet
          </Button>
        </div>
      </PoliciesLayout>
    );
  }

  if (!policies) {
    return (
      <PoliciesLayout>
        <p className={styles.emptyState}>{status === 'loading' ? 'Loading...' : null}</p>
      </PoliciesLayout>
    );
  }

  if (!filteredPolicies.length) {
    let policyQualifier;
    if (filter === 'active') {
      policyQualifier = <span className={styles.highlight}>active </span>;
    } else if (filter === 'inactive') {
      policyQualifier = <span className={styles.highlight}>inactive </span>;
    }

    return (
      <PoliciesLayout>
        <p className={styles.emptyState}>
          {policies.length === 0 ? (
            <>
              You don't have any policies associated with the connected address.
              <br />
              Connect an address associated with a policy to start a claim.
            </>
          ) : filter === 'none' ? (
            <>Please select a filter.</>
          ) : query ? (
            <>
              We couldn't find any {policyQualifier}policies with <span className={styles.highlight}>"{query}"</span>.
              <br />
              Please try a different search term.
            </>
          ) : (
            <>
              You don't have any {policyQualifier}policies associated with the connected address.
              <br />
              Connect an address associated with a policy to start a claim.
            </>
          )}
        </p>
      </PoliciesLayout>
    );
  }

  return (
    <PoliciesLayout>
      <PolicyList policies={pagedPolicies} />
      <Pagination totalResults={filteredPolicies.length} currentPage={currentPage} className={styles.pagination} />
    </PoliciesLayout>
  );
}

interface PoliciesLayoutProps {
  children: ReactNode;
}

function PoliciesLayout(props: PoliciesLayoutProps) {
  const params = useQueryParams();
  const history = useHistory();

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

  const filter = params.get('filter');
  const activeChecked = !filter || filter === 'active';
  const inactiveChecked = !filter || filter === 'inactive';

  const query = params.get('query') || '';
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
        content={props.children}
      />
    </Layout>
  );
}
