import { FormEventHandler, ReactNode, useMemo } from 'react';
import { connectWallet } from '../../components/sign-in/sign-in';
import Layout from '../../components/layout';
import Button from '../../components/button';
import RadioButton from '../../components/radio-button';
import BorderedBox, { Header } from '../../components/bordered-box';
import Pagination, { usePagedData } from '../components/policies/pagination';
import SearchForm from '../components/search-form';
import ClaimList from './claim-list';
import { useQueryParams } from '../../utils';
import { useHistory } from 'react-router';
import { useChainData } from '../../chain-data';
import { isActive, useUserClaims } from '../../logic/claims';
import { useUserPolicies, isActive as isPolicyActive } from '../../logic/policies';
import styles from './my-claims.module.scss';

export default function MyClaims() {
  const { data: claims, status } = useUserClaims();

  const params = useQueryParams();
  const query = params.get('query') || '';
  const filter = params.get('filter');
  const currentPage = parseInt(params.get('page') || '1');

  const filteredClaims = useMemo(() => {
    if (!claims || filter === 'none') return [];

    const lowerCasedQuery = query.toLowerCase();
    const results = lowerCasedQuery
      ? claims.filter((claim) => {
          return (
            claim.claimId.toLowerCase().includes(lowerCasedQuery) ||
            claim.policy.metadata.toLowerCase().includes(lowerCasedQuery)
          );
        })
      : claims;

    switch (filter) {
      case 'active':
        return results.filter((claim) => isActive(claim));
      case 'inactive':
        return results.filter((claim) => !isActive(claim));
      default:
        return results;
    }
  }, [claims, query, filter]);

  const pagedClaims = usePagedData(filteredClaims, { currentPage });

  const { provider, setChainData } = useChainData();
  if (!provider) {
    return (
      <ClaimsLayout>
        <div className={styles.emptyState}>
          <span>You need to be connected to view claims.</span>
          <Button variant="link" onClick={connectWallet(setChainData)}>
            Connect your wallet
          </Button>
        </div>
      </ClaimsLayout>
    );
  }

  if (!claims) {
    return (
      <ClaimsLayout>
        <p className={styles.emptyState}>{status === 'loading' ? 'Loading...' : null}</p>
      </ClaimsLayout>
    );
  }

  return (
    <ClaimsLayout>
      {filteredClaims.length > 0 ? (
        <ClaimList claims={pagedClaims} />
      ) : claims.length === 0 ? (
        <p className={styles.emptyState}>There are no claims linked to your account.</p>
      ) : (
        <p className={styles.emptyState}>There are no matching claims.</p>
      )}
      <Pagination totalResults={filteredClaims.length} currentPage={currentPage} className={styles.pagination} />
    </ClaimsLayout>
  );
}

interface ClaimsLayoutProps {
  children: ReactNode;
}

function ClaimsLayout(props: ClaimsLayoutProps) {
  const { data: policies } = useUserPolicies();
  const activePolicies = policies?.filter((policy) => isPolicyActive(policy));

  const history = useHistory();
  const params = useQueryParams();
  const query = params.get('query') || '';
  const filter = params.get('filter');

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

    history.replace('/claims?' + newParams.toString());
  };

  const handleSubmit: FormEventHandler<HTMLFormElement> = (ev) => {
    ev.preventDefault();
    const { value } = ev.currentTarget.query;
    // We don't want to keep any search params
    const newParams = new URLSearchParams();
    newParams.set('query', value.trim());
    history.replace('/claims?' + newParams.toString());
  };

  const handleClear = () => {
    const newParams = new URLSearchParams(params);
    // We only want to keep the "filter" search param if present
    newParams.delete('query');
    newParams.delete('page');
    history.replace('/claims?' + newParams.toString());
  };

  const activeChecked = !filter || filter === 'active';
  const inactiveChecked = !filter || filter === 'inactive';
  return (
    <Layout title="Claims">
      <SearchForm
        query={query}
        placeholder="Search by claim ID or policy"
        onSubmit={handleSubmit}
        onClear={handleClear}
      />
      <BorderedBox
        noMobileBorders
        header={
          <Header>
            <h5>My Claims</h5>
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
              <Button
                className={styles.newClaimButton}
                variant="secondary"
                onClick={() => {
                  if (activePolicies?.length === 1) {
                    history.push(`/policies/${activePolicies[0]!.policyId}`);
                  } else {
                    history.push('/claims/new');
                  }
                }}
              >
                New Claim
              </Button>
            </div>
          </Header>
        }
        content={props.children}
      />
    </Layout>
  );
}
