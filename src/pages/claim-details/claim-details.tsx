import { ReactNode } from 'react';
import { Link } from 'react-router-dom';
import { BaseLayout } from '../../components/layout';
import BorderedBox, { Header } from '../../components/bordered-box';
import ExternalLink from '../../components/external-link';
import Timer, { DATE_FORMAT } from '../../components/timer';
import ClaimActions from './claim-actions';
import { useParams } from 'react-router';
import { useChainData } from '../../chain-data';
import { useUserClaimById, getCurrentDeadline } from '../../logic/claims';
import { format } from 'date-fns';
import { formatUsd, getIpfsUrl, images, useForceUpdate, useScrollToTop } from '../../utils';
import globalStyles from '../../styles/global-styles.module.scss';
import styles from './claim-details.module.scss';

interface Params {
  claimId: string;
}

export default function ClaimDetails() {
  useScrollToTop();
  const { claimId } = useParams<Params>();
  const { data: claim, status } = useUserClaimById(claimId);

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
          <h4>Claim {claimId}</h4>
        </div>
        {status === 'loading' && <p className={globalStyles.secondaryColor}>Loading...</p>}
        {status === 'loaded' && <p>Unable to find your claim with given id.</p>}
      </ClaimDetailsLayout>
    );
  }

  const evidenceHref = getIpfsUrl(claim.evidence);
  const deadline = getCurrentDeadline(claim);
  return (
    <ClaimDetailsLayout claimId={claimId}>
      <div className={styles.detailsHeader}>
        <h4>Claim {claimId}</h4>
        {deadline && <Timer size="large" deadline={deadline} onDeadlineExceeded={forceUpdate} showDeadline />}
      </div>
      <ClaimActions key={claim.status} claim={claim} />
      <BorderedBox
        noMobileBorders
        header={
          <Header>
            <h5>Summary</h5>
          </Header>
        }
        content={
          <div className={styles.detailsSection}>
            <div className={styles.detailsItem}>
              <p className={globalStyles.bold}>Created</p>
              <p className={globalStyles.secondaryColor}>{format(claim.timestamp, DATE_FORMAT)}</p>
            </div>
            <div className={styles.detailsItem}>
              <p className={globalStyles.bold}>Evidence</p>
              <ExternalLink href={evidenceHref} className={globalStyles.secondaryColor}>
                {evidenceHref}
              </ExternalLink>
            </div>
            <div className={styles.detailsItem}>
              <p className={globalStyles.bold}>Claim Amount</p>
              <p className={globalStyles.secondaryColor}>${formatUsd(claim.claimAmountInUsd)}</p>
            </div>
            <div className={styles.detailsItem}>
              <p className={globalStyles.bold}>Claimant</p>
              <p className={globalStyles.secondaryColor}>{claim.claimant}</p>
            </div>
            <div className={styles.detailsItem}>
              <p className={globalStyles.bold}>Payout Address</p>
              <p className={globalStyles.secondaryColor}>{claim.beneficiary}</p>
            </div>
          </div>
        }
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
        <Link to="/claims" className={styles.backLink}>
          <img src={images.arrowLeft} alt="back" />
          Back
        </Link>
      </div>
      {props.children}
    </BaseLayout>
  );
}
