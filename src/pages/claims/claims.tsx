import { ReactNode, useMemo } from 'react';
import { connectWallet } from '../../components/sign-in/sign-in';
import Layout from '../../components/layout';
import Button from '../../components/button';
import RadioButton from '../../components/radio-button';
import BorderedBox, { Header } from '../../components/bordered-box';
import ClaimList from './claim-list';
import { useQueryParams } from '../../utils';
import { useHistory } from 'react-router';
import { useChainData } from '../../chain-data';
import { isActive, useUserClaims } from '../../logic/claims';
import styles from './claims.module.scss';

export default function Claims() {
  const { data: claims, status } = useUserClaims();

  const params = useQueryParams();
  const filter = params.get('filter');
  const filteredClaims = useMemo(() => {
    if (!claims) return [];
    switch (filter) {
      case 'none':
        return [];
      case 'active':
        return claims.filter((claim) => isActive(claim));
      case 'inactive':
        return claims.filter((claim) => !isActive(claim));
      default:
        return claims;
    }
  }, [claims, filter]);

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
        <ClaimList claims={filteredClaims} />
      ) : claims.length === 0 ? (
        <p className={styles.emptyState}>There are no claims linked to your account.</p>
      ) : (
        <p className={styles.emptyState}>There are no matching claims.</p>
      )}
    </ClaimsLayout>
  );
}

interface ClaimsLayoutProps {
  children: ReactNode;
}

function ClaimsLayout(props: ClaimsLayoutProps) {
  const history = useHistory();
  const handleFilterChange = (showActive: boolean, showInactive: boolean) => {
    if (showActive && !showInactive) {
      history.replace(`/claims?filter=active`);
    } else if (!showActive && showInactive) {
      history.replace(`/claims?filter=inactive`);
    } else if (!showActive && !showInactive) {
      history.replace(`/claims?filter=none`);
    } else {
      history.replace(`/claims`);
    }
  };

  const params = useQueryParams();
  const filter = params.get('filter');
  const activeChecked = !filter || filter === 'active';
  const inactiveChecked = !filter || filter === 'inactive';
  return (
    <Layout title="Claims">
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
              <Button className={styles.newClaimButton} variant="secondary" onClick={() => history.push('/claims/new')}>
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
