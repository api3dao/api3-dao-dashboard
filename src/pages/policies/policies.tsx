import { ReactNode, useMemo } from 'react';
import { useHistory } from 'react-router';
import Layout from '../../components/layout';
import BorderedBox, { Header } from '../../components/bordered-box';
import RadioButton from '../../components/radio-button';
import Button from '../../components/button';
import PolicyList from './policy-list';
import { useQueryParams } from '../../utils';
import { connectWallet } from '../../components/sign-in/sign-in';
import { useChainData } from '../../chain-data';
import { useUserPolicies, isActive } from '../../logic/policies';
import styles from '../claims/claims.module.scss';

export default function Policies() {
  const { data: policies, status } = useUserPolicies();

  const params = useQueryParams();
  const filter = params.get('filter');
  const filteredPolicies = useMemo(() => {
    if (!policies) return [];
    switch (filter) {
      case 'none':
        return [];
      case 'active':
        return policies.filter((policy) => isActive(policy));
      case 'inactive':
        return policies.filter((policy) => !isActive(policy));
      default:
        return policies;
    }
  }, [policies, filter]);

  const { provider, setChainData } = useChainData();
  if (!provider) {
    return (
      <PoliciesLayout>
        <div className={styles.emptyState}>
          <span>You need to be connected to view your policies.</span>
          <Button type="link" onClick={connectWallet(setChainData)}>
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

  return (
    <PoliciesLayout>
      {filteredPolicies.length > 0 ? (
        <PolicyList policies={filteredPolicies} />
      ) : policies.length === 0 ? (
        <p className={styles.emptyState}>There are no policies linked to your account.</p>
      ) : (
        <p className={styles.emptyState}>There are no matching policies.</p>
      )}
    </PoliciesLayout>
  );
}

interface PoliciesLayoutProps {
  children: ReactNode;
}

function PoliciesLayout(props: PoliciesLayoutProps) {
  const history = useHistory();
  const handleFilterChange = (showActive: boolean, showInactive: boolean) => {
    if (showActive && !showInactive) {
      history.replace(`/policies?filter=active`);
    } else if (!showActive && showInactive) {
      history.replace(`/policies?filter=inactive`);
    } else if (!showActive && !showInactive) {
      history.replace(`/policies?filter=none`);
    } else {
      history.replace(`/policies`);
    }
  };

  const params = useQueryParams();
  const filter = params.get('filter');
  const activeChecked = !filter || filter === 'active';
  const inactiveChecked = !filter || filter === 'inactive';
  return (
    <Layout title="Policies">
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
