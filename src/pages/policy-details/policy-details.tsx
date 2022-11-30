import { ReactNode } from 'react';
import { BaseLayout } from '../../components/layout';
import BorderedBox, { Header } from '../../components/bordered-box';
import Button from '../../components/button';
import { Tooltip } from '../../components/tooltip';
import ExternalLink from '../../components/external-link';
import BackButton from '../../components/back-button';
import { format } from 'date-fns';
import { formatUsd, getIpfsUrl, useScrollToTop } from '../../utils';
import { getEtherscanAddressUrl } from '../../contracts';
import { useHistory, useParams } from 'react-router';
import { useChainData } from '../../chain-data';
import { canCreateClaim, isActive, useUserPolicyById } from '../../logic/policies';
import globalStyles from '../../styles/global-styles.module.scss';
import styles from './policy-details.module.scss';

interface Params {
  policyId: string;
}

export default function PolicyDetails() {
  useScrollToTop();
  const { policyId } = useParams<Params>();
  const { provider, chainId } = useChainData();
  const history = useHistory();
  const { data: policy, status } = useUserPolicyById(policyId);

  if (!provider) {
    return (
      <BaseLayout subtitle={`Policy ${policyId}`}>
        <p className={globalStyles.textCenter}>Please connect your wallet to see the policy details.</p>
      </BaseLayout>
    );
  }

  if (!policy) {
    return (
      <PolicyDetailsLayout policyId={policyId}>
        {status === 'loading' && <p className={styles.loading}>Loading...</p>}
        {status === 'loaded' && <p>Unable to find your policy with given id.</p>}
      </PolicyDetailsLayout>
    );
  }

  const policyIpfsHref = getIpfsUrl(policy.ipfsHash);
  return (
    <PolicyDetailsLayout policyId={policyId}>
      <header className={styles.header}>
        <h4 className={styles.heading}>{policy.metadata}</h4>
        <div className={styles.extraInfo}>
          {isActive(policy) ? (
            <span className={styles.active} data-testid="status">
              Active
            </span>
          ) : (
            <span className={styles.inactive} data-testid="status">
              Inactive
            </span>
          )}
          <span className={styles.divider}>{' | '}</span>
          <span className={styles.allowedUntil}>
            Claims Allowed Until:{' '}
            <span className="visual-test:invisible">
              <span className={globalStyles.primaryColor}>{format(policy.claimsAllowedUntil, 'do MMMM yyyy')} </span>
              {format(policy.claimsAllowedUntil, 'HH:mm')}
            </span>
          </span>
        </div>
      </header>
      <BorderedBox
        noMobileBorders
        header={
          <Header>
            <h5>Details</h5>
            {canCreateClaim(policy) ? (
              <Button
                variant="primary"
                size="large"
                onClick={() => history.push(`/policies/${policy.policyId}/claims/new`)}
              >
                + New Claim
              </Button>
            ) : (
              <Tooltip overlay={<div>Claims are unable to be made for inactive policies.</div>}>
                <div>
                  <Button variant="primary" size="large" disabled>
                    + New Claim
                  </Button>
                </div>
              </Tooltip>
            )}
          </Header>
        }
        content={
          <div className={styles.detailsSection}>
            <div className={styles.detailsItem}>
              <p className={globalStyles.bold}>Claimant Address</p>
              <ExternalLink
                href={getEtherscanAddressUrl(chainId, policy.claimant)}
                className={globalStyles.secondaryColor}
              >
                {policy.claimant}
              </ExternalLink>
            </div>
            <div className={styles.detailsItem}>
              <p className={globalStyles.bold}>Remaining Service Coverage Amount</p>
              <p className={globalStyles.secondaryColor} data-testid="remaining-coverage">
                {formatUsd(policy.remainingCoverageInUsd)} USD
              </p>
            </div>
            <div className={styles.detailsItem}>
              <p className={globalStyles.bold}>Claims Allowed From</p>
              <p className={`${globalStyles.secondaryColor} visual-test:invisible`}>
                {format(policy.claimsAllowedFrom, 'do MMMM yyyy HH:mm')}
              </p>
            </div>
            <div className={`${styles.detailsItem} ${styles.allowedUntil}`}>
              <p className={globalStyles.bold}>Claims Allowed Until</p>
              <p className={`${globalStyles.secondaryColor} visual-test:invisible`}>
                {format(policy.claimsAllowedUntil, 'do MMMM yyyy HH:mm')}
              </p>
            </div>
            <div className={styles.detailsItem}>
              <p className={globalStyles.bold}>Service Coverage Terms and Conditions</p>
              <ExternalLink href={policyIpfsHref} className={globalStyles.secondaryColor}>
                {policyIpfsHref}
              </ExternalLink>
            </div>
          </div>
        }
      />
    </PolicyDetailsLayout>
  );
}

interface PolicyDetailsLayoutProps {
  policyId: string;
  children: ReactNode;
}

function PolicyDetailsLayout(props: PolicyDetailsLayoutProps) {
  return (
    <BaseLayout subtitle={`Policy ${props.policyId}`}>
      <div className={styles.backButtonRow}>
        <BackButton fallback={{ href: '/claims' }}>Back</BackButton>
        {' | '}
        <span>Policy ID: {props.policyId}</span>
      </div>
      {props.children}
    </BaseLayout>
  );
}
