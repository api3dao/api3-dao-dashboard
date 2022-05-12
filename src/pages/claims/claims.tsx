import { ReactNode } from 'react';
import { connectWallet } from '../../components/sign-in/sign-in';
import Layout from '../../components/layout';
import Button from '../../components/button';
import BorderedBox, { Header } from '../../components/bordered-box';
import ClaimList from './claim-list';
import { useChainData } from '../../chain-data';
import { useClaims } from '../../logic/claims';
import styles from './claims.module.scss';

export default function Claims() {
  const { provider, setChainData } = useChainData();
  const { data: claims, loading } = useClaims();

  if (!provider) {
    return (
      <ClaimsLayout>
        <div className={styles.emptyState}>
          <span>You need to be connected to view claims.</span>
          <Button type="link" onClick={connectWallet(setChainData)}>
            Connect your wallet
          </Button>
        </div>
      </ClaimsLayout>
    );
  }

  return (
    <ClaimsLayout>
      {claims ? (
        <ClaimList claims={claims} />
      ) : (
        <div className={styles.emptyState}>{loading ? 'Loading...' : null}</div>
      )}
    </ClaimsLayout>
  );
}

interface ClaimsLayoutProps {
  children: ReactNode;
}

function ClaimsLayout(props: ClaimsLayoutProps) {
  return (
    <Layout title="Claims">
      <BorderedBox
        noMobileBorders
        header={
          <Header>
            <h5>Claims</h5>
          </Header>
        }
        content={props.children}
      />
    </Layout>
  );
}
