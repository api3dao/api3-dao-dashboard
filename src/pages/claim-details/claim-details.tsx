import { ReactNode } from 'react';
import { Link } from 'react-router-dom';
import { BaseLayout } from '../../components/layout';
import BorderedBox, { Header } from '../../components/bordered-box';
import ExternalLink from '../../components/external-link';
import BackButton from '../../components/back-button';
import Timer from '../../components/timer';
import Skeleton from '../../components/skeleton';
import { Tooltip } from '../../components/tooltip';
import ClaimActions from './claim-actions';
import { useParams } from 'react-router';
import { abbrStr, useChainData, Claim } from '../../chain-data';
import { useUserClaimDataById, getCurrentDeadline } from '../../logic/claims';
import { useUserPolicyById } from '../../logic/policies';
import { format } from 'date-fns';
import { formatUsd, getIpfsUrl, images, useForceUpdate, useScrollToTop } from '../../utils';
import { getEtherscanAddressUrl } from '../../contracts';
import globalStyles from '../../styles/global-styles.module.scss';
import styles from './claim-details.module.scss';

interface Params {
  claimId: string;
}

export default function ClaimDetails() {
  useScrollToTop();
  const { claimId } = useParams<Params>();
  const { claim, payout, status } = useUserClaimDataById(claimId);

  // We need to trigger a re-render the moment we go past the deadline
  const forceUpdate = useForceUpdate();
  const { provider } = useChainData();

  if (!provider) {
    return (
      <BaseLayout subtitle={`Claim ${claimId}`}>
        <p className={globalStyles.textCenter}>Please connect your wallet to see the claim details.</p>
      </BaseLayout>
    );
  }

  if (!claim) {
    return (
      <ClaimDetailsLayout claimId={claimId}>
        <div className={styles.detailsHeader}>
          <h4>Claim {abbrStr(claimId)}</h4>
        </div>
        {status === 'loading' && <p className={globalStyles.secondaryColor}>Loading...</p>}
        {status === 'loaded' && <p>Unable to find your claim with given id.</p>}
      </ClaimDetailsLayout>
    );
  }

  const deadline = getCurrentDeadline(claim);
  return (
    <ClaimDetailsLayout claimId={claimId}>
      <div className={styles.detailsHeader}>
        <h4>Claim {abbrStr(claimId)}</h4>
        {deadline && <Timer size="large" deadline={deadline} onDeadlineExceeded={forceUpdate} showDeadline />}
      </div>
      <ClaimActions key={claim.status} claim={claim} payout={payout} />
      <BorderedBox
        noMobileBorders
        header={
          <Header>
            <h5>Summary</h5>
            {claim.dispute && (
              <ExternalLink href={`https://resolve.kleros.io/cases/${claim.dispute.id}`} className={styles.disputeLink}>
                View Dispute Resolver
              </ExternalLink>
            )}
          </Header>
        }
        content={<ClaimSummary claim={claim} />}
      />
    </ClaimDetailsLayout>
  );
}

interface ClaimDetailsLayoutProps {
  claimId: string;
  children: ReactNode;
}

function ClaimDetailsLayout(props: ClaimDetailsLayoutProps) {
  return (
    <BaseLayout subtitle={`Claim ${props.claimId}`}>
      <div>
        <BackButton fallback={{ href: '/claims' }}>Back</BackButton>
      </div>
      {props.children}
    </BaseLayout>
  );
}

interface ClaimSummaryProps {
  claim: Claim;
}

function ClaimSummary(props: ClaimSummaryProps) {
  const { claim } = props;
  const { chainId } = useChainData();
  const { data: policy, status: policyStatus } = useUserPolicyById(claim.policy.id);

  const evidenceHref = getIpfsUrl(claim.evidence);

  return (
    <div className={styles.detailsSection}>
      <div className={styles.detailsItem}>
        <ExternalLink href={evidenceHref} className={globalStyles.secondaryColor}>
          {evidenceHref}
        </ExternalLink>
      </div>
      <div className={styles.detailsItem}>
        <p className={globalStyles.bold}>Claim Amount</p>
        <p className={globalStyles.secondaryColor}>${formatUsd(claim.claimAmountInUsd)}</p>
      </div>
      {claim.settlementAmountInUsd && (
        <div className={styles.detailsItem}>
          <p className={`${globalStyles.bold} ${styles.labelWithTooltip}`}>
            Proposed Settlement Amount
            <Tooltip
              id="settlement-tooltip"
              overlay="The API3 Mediators proposed this settlement when they initially evaluated this claim"
            >
              <button aria-describedby="settlement-tooltip">
                <img src={images.help} aria-hidden alt="" />
                <span className="sr-only">View settlement info</span>
              </button>
            </Tooltip>
          </p>
          <p className={globalStyles.secondaryColor}>${formatUsd(claim.settlementAmountInUsd)}</p>
        </div>
      )}
      <div className={styles.detailsItem}>
        <p className={globalStyles.bold}>Remaining Service Coverage Amount</p>
        <div className={globalStyles.secondaryColor}>
          {policy ? (
            <>${formatUsd(policy.remainingCoverageInUsd)}</>
          ) : policyStatus === 'failed' ? (
            '-'
          ) : (
            <Skeleton width="8ch" />
          )}
        </div>
      </div>
      <div className={styles.detailsItem}>
        <p className={globalStyles.bold}>Service Coverage Policy</p>
        <p className={globalStyles.secondaryColor}>
          <Link to={`/policies/${claim.policy.id}`}>{claim.policy.metadata}</Link>
        </p>
      </div>
      <div className={styles.detailsItem}>
        <p className={globalStyles.bold}>Beneficiary</p>
        <p className={globalStyles.secondaryColor}>
          <ExternalLink href={getEtherscanAddressUrl(chainId, claim.beneficiary)}>{claim.beneficiary}</ExternalLink>
        </p>
      </div>
      <div className={styles.detailsItem}>
        <p className={globalStyles.bold}>Claim Created</p>
        <p className={globalStyles.secondaryColor}>{format(claim.timestamp, 'do MMMM yyyy hh:mm')}</p>
      </div>
    </div>
  );
}
