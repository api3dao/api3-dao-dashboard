import { useMemo } from 'react';
import ConnectButton from '../../../components/connect-button';
import PolicyList from './policy-list';
import Pagination, { usePagedData } from '../../../components/pagination';
import { useChainData } from '../../../chain-data';
import { useUserPolicies, isActive } from '../../../logic/policies';
import styles from './policies.module.scss';

interface Props {
  query: string | null;
  filter: Filter;
  currentPage: number;
}

export type Filter = 'active' | 'inactive' | 'none' | null;

export default function Policies(props: Props) {
  const { query, filter, currentPage } = props;
  const { data: policies, status } = useUserPolicies();

  const filteredPolicies = useMemo(() => {
    if (!policies || filter === 'none') return [];

    const results = query
      ? policies.filter((policy) => policy.metadata.toLowerCase().includes(query.toLowerCase()))
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

  const { provider } = useChainData();
  if (!provider) {
    return (
      <div className={styles.emptyState}>
        You need to be connected to view your policies.
        <ConnectButton variant="link" className={styles.connectButton}>
          Connect your wallet
        </ConnectButton>
      </div>
    );
  }

  if (!policies) {
    return <p className={styles.emptyState}>{status === 'loading' ? 'Loading...' : null}</p>;
  }

  if (!filteredPolicies.length) {
    let policyQualifier;
    if (filter === 'active') {
      policyQualifier = <span className={styles.highlight}>active </span>;
    } else if (filter === 'inactive') {
      policyQualifier = <span className={styles.highlight}>inactive </span>;
    }

    return (
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
    );
  }

  return (
    <>
      <PolicyList policies={pagedPolicies} />
      <Pagination totalResults={filteredPolicies.length} currentPage={currentPage} className={styles.pagination} />
    </>
  );
}
