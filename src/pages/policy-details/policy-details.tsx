import { Link } from 'react-router-dom';
import { BaseLayout } from '../../components/layout';
import BorderedBox, { Header } from '../../components/bordered-box';
import Button from '../../components/button';
import { Tooltip } from '../../components/tooltip';
import ExternalLink from '../../components/external-link';
import ArrowLeftIcon from '../../components/icons/ArrowLeftIcon';
import { format } from 'date-fns';
import { formatUsd, useQueryParams } from '../../utils';
import { useHistory, useParams } from 'react-router';
import { useChainData } from '../../chain-data';
import { canCreateClaim, useUserPolicyById } from '../../logic/policies';
import globalStyles from '../../styles/global-styles.module.scss';
import styles from './policy-details.module.scss';

interface Params {
  policyId: string;
}

export default function PolicyDetails() {
  const { policyId } = useParams<Params>();
  const { provider } = useChainData();
  const history = useHistory();
  const params = useQueryParams();
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
      <BaseLayout subtitle={`Policy ${policyId}`}>
        <h4 className={styles.heading}>Policy</h4>
        {status === 'loading' && <p className={globalStyles.secondaryColor}>Loading...</p>}
        {status === 'loaded' && <p>Unable to find your policy with given id.</p>}
      </BaseLayout>
    );
  }

  const policyIpfsHref = `https://ipfs.io/ipfs/${policy.ipfsHash}`;
  return (
    <BaseLayout subtitle={`Policy ${policyId}`}>
      <div>
        {params.get('from') === 'claims' ? (
          <Link to="/claims" className={styles.backLink}>
            <ArrowLeftIcon aria-hidden />
            Back to My Claims
          </Link>
        ) : (
          <Link to="/policies" className={styles.backLink}>
            <ArrowLeftIcon aria-hidden />
            Back to My Policies
          </Link>
        )}
      </div>
      <h4 className={styles.heading}>{policy.metadata}</h4>
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
              <p className={globalStyles.secondaryColor}>{policy.claimant}</p>
            </div>
            <div className={styles.detailsItem}>
              <p className={globalStyles.bold}>Beneficiary Address</p>
              <p className={globalStyles.secondaryColor}>{policy.beneficiary}</p>
            </div>
            <div className={styles.detailsItem}>
              <p className={globalStyles.bold}>Service Coverage Amount</p>
              <p className={globalStyles.secondaryColor}>${formatUsd(policy.coverageAmountInUsd)}</p>
            </div>
            <div className={styles.detailsItem}>
              <p className={globalStyles.bold}>Claims Allowed From</p>
              <p className={globalStyles.secondaryColor}>{format(policy.claimsAllowedFrom, 'dd MMMM yyyy HH:mm')}</p>
            </div>
            <div className={styles.detailsItem}>
              <p className={globalStyles.bold}>Claims Allowed Until</p>
              <p className={globalStyles.secondaryColor}>{format(policy.claimsAllowedUntil, 'dd MMMM yyyy HH:mm')}</p>
            </div>
            <div className={styles.detailsItem}>
              <p className={globalStyles.bold}>Policy Hash</p>
              <p className={globalStyles.secondaryColor}>{policy.policyId}</p>
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
    </BaseLayout>
  );
}
