import { ReactNode } from 'react';
import { NavLink } from 'react-router-dom';
import Layout from '../../components/layout';
import BorderedBox, { Header } from '../../components/bordered-box';
import Timer, { DATE_FORMAT } from '../../components/timer';
import Button from '../../components/button';
import { connectWallet } from '../../components/sign-in/sign-in';
import { images } from '../../utils';
import { Claim, useChainData } from '../../chain-data';
import { useClaims } from '../../logic/claims';
import { format } from 'date-fns';
import styles from './claims.module.scss';

export default function Claims() {
  const { provider, setChainData } = useChainData();
  const { data: claims, loading } = useClaims();

  if (!provider) {
    return (
      <ClaimsLayout>
        <div className={styles.noClaims}>
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
        <ul className={styles.claimsList}>
          {claims.map((claim) => (
            <ClaimListItem key={claim.claimId} claim={claim} />
          ))}
        </ul>
      ) : loading ? (
        <div className={styles.noClaims}>Loading...</div>
      ) : null}
    </ClaimsLayout>
  );
}

interface ClaimListItemProps {
  claim: Claim;
}

function ClaimListItem(props: ClaimListItemProps) {
  const { claim } = props;
  return (
    <li className={styles.claimItem}>
      <div className={styles.claimItemMain}>
        <NavLink className={styles.claimItemTitle} to={`/claims/${claim.claimId}`}>
          Claim {claim.claimId}
        </NavLink>

        <div className={styles.claimItemInfo}>
          {claim.deadline ? <Timer deadline={claim.deadline} /> : <span>{format(claim.timestamp, DATE_FORMAT)}</span>}
          <NavLink to={`/policies/${claim.policyId}`}>Policy</NavLink>
        </div>
      </div>

      <div className={styles.claimItemStatus}>
        <ClaimStatus claim={claim} />
        <NavLink tabIndex={-1} to={`/claims/${claim.claimId}`}>
          <img src={images.arrowRight} alt="right arrow" />
        </NavLink>
      </div>
    </li>
  );
}

interface ClaimStatusProps {
  claim: Claim;
}

function ClaimStatus(props: ClaimStatusProps) {
  const { claim } = props;
  switch (claim.status) {
    case 'Submitted':
    case 'Appealed':
      return <>Processing</>;
    case 'MediationOffered':
      return <>Countered</>;
    case 'Resolved':
      return claim.claimedAmount === claim.resolvedAmount ? <>Approved</> : <>Countered</>;
    case 'Rejected':
      return <>Rejected</>;
    default:
      return null;
  }
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
