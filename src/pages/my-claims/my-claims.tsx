import { ReactNode, useMemo } from 'react';
import { connectWallet } from '../../components/sign-in/sign-in';
import Layout from '../../components/layout';
import Button from '../../components/button';
import RadioButton from '../../components/radio-button';
import BorderedBox, { Header } from '../../components/bordered-box';
import Pagination, { usePagedData } from '../../components/pagination';
import SearchForm from '../components/search-form';
import Roles from './roles';
import ClaimList from './claim-list';
import { useQueryParams } from '../../utils';
import { useHistory } from 'react-router';
import { useChainData } from '../../chain-data';
import { isActive, useUserClaims } from '../../logic/claims';
import { useUserPolicies, isActive as isPolicyActive } from '../../logic/policies';
import styles from './my-claims.module.scss';

type Filter = 'active' | 'inactive' | 'none' | null;

export default function MyClaims() {
  const { data: claims, status } = useUserClaims();

  const params = useQueryParams();
  const query = params.get('query') || '';
  const filter = params.get('filter') as Filter;
  const currentPage = parseInt(params.get('page') || '1', 10);

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
          <span>You need to be connected to view your claims.</span>
          <Button variant="link" onClick={connectWallet(setChainData)} className={styles.connectButton}>
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

  if (!filteredClaims.length) {
    let claimQualifier;
    if (filter === 'active') {
      claimQualifier = <span className={styles.highlight}>active </span>;
    } else if (filter === 'inactive') {
      claimQualifier = <span className={styles.highlight}>inactive </span>;
    }

    return (
      <ClaimsLayout>
        <p className={styles.emptyState}>
          {claims.length === 0 ? (
            <>
              You don't have any claims associated with the connected address.
              <br />
              Connect an address associated with a policy to start a claim.
            </>
          ) : filter === 'none' ? (
            <>Please select a filter.</>
          ) : query ? (
            <>
              We couldn't find any {claimQualifier}claims with <span className={styles.highlight}>"{query}"</span>.
              <br />
              Please try a different search term.
            </>
          ) : (
            <>
              You don't have any {claimQualifier}claims associated with the connected address.
              <br />
              Connect an address associated with a policy to start a claim.
            </>
          )}
        </p>
      </ClaimsLayout>
    );
  }

  return (
    <ClaimsLayout>
      <ClaimList claims={pagedClaims} />
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
  const filter = params.get('filter') as Filter;

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

  const handleSubmit = (value: string) => {
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
      <div className={styles.container}>
        <SearchForm
          query={query}
          placeholder="Search by claim ID or policy"
          onSubmit={handleSubmit}
          onClear={handleClear}
        />
        <Roles />
      </div>
      <BorderedBox
        noMobileBorders
        header={
          <Header>
            <div className={styles.myClaimsHeader}>
              <h5>My Claims</h5>
              <div className={styles.actions}>
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
                  variant="primary"
                  onClick={() => {
                    if (activePolicies?.length === 1) {
                      history.push(`/policies/${activePolicies[0]!.policyId}`);
                    } else {
                      history.push('/claims/new');
                    }
                  }}
                >
                  + New Claim
                </Button>
              </div>
            </div>
          </Header>
        }
        content={props.children}
      />
    </Layout>
  );
}
