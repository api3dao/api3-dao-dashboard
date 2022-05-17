import { BaseLayout } from '../../components/layout';
import { useParams } from 'react-router';
import { Link } from 'react-router-dom';
import BorderedBox, { Header } from '../../components/bordered-box';
import ExternalLink from '../../components/external-link';
import ClaimActions from './claim-actions';
import { useChainData } from '../../chain-data';
import { useClaimById } from '../../logic/claims';
import { formatApi3, images } from '../../utils';
import globalStyles from '../../styles/global-styles.module.scss';
import styles from './claim-details.module.scss';

interface Params {
  claimId: string;
}

export default function ClaimDetails() {
  const { claimId } = useParams<Params>();
  const { data: claim, loading, loaded } = useClaimById(claimId);
  const { provider, userAccount } = useChainData();
  if (!provider) {
    return (
      <BaseLayout subtitle={`Claim ${claimId}`}>
        <p className={globalStyles.textCenter}>Please connect your wallet to see the claim details.</p>
      </BaseLayout>
    );
  }

  if (!claim) {
    return (
      <BaseLayout subtitle={`Claim ${claimId}`}>
        <div>
          <Link to="/claims" className={styles.backLink}>
            <img src={images.arrowLeft} alt="back" />
            Back
          </Link>
        </div>
        <h4 className={styles.heading}>Claim {claimId}</h4>
        {loading && <p className={globalStyles.secondaryColor}>Loading...</p>}
        {loaded && <p>Unable to find claim with given id.</p>}
      </BaseLayout>
    );
  }

  const evidenceHref = `https://ipfs.io/ipfs/${claim.evidence}`;
  const transactionHref = claim.transactionHash ? `https://etherscan.io/tx/${claim.transactionHash}` : null;
  return (
    <BaseLayout subtitle={`Claim ${claimId}`}>
      <div>
        <Link to="/claims" className={styles.backLink}>
          <img src={images.arrowLeft} alt="back" />
          Back
        </Link>
      </div>
      <h4 className={styles.heading}>Claim {claimId}</h4>
      <ClaimActions claim={claim} currentAccount={userAccount} />
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
              <p className={globalStyles.bold}>Evidence</p>
              <ExternalLink href={evidenceHref} className={globalStyles.secondaryColor}>
                {evidenceHref}
              </ExternalLink>
            </div>
            <div className={styles.detailsItem}>
              <p className={globalStyles.bold}>Claim Amount</p>
              <p className={globalStyles.secondaryColor}>{formatApi3(claim.claimedAmount)}</p>
            </div>
            <div className={styles.detailsItem}>
              <p className={globalStyles.bold}>Claimant</p>
              <p className={globalStyles.secondaryColor}>{claim.claimant}</p>
            </div>
            <div className={styles.detailsItem}>
              <p className={globalStyles.bold}>Payout Address</p>
              <p className={globalStyles.secondaryColor}>{claim.beneficiary}</p>
            </div>
            <div className={styles.detailsItem}>
              <p className={globalStyles.bold}>Payout Transaction</p>
              {transactionHref ? (
                <ExternalLink href={transactionHref}>{transactionHref}</ExternalLink>
              ) : (
                <p className={globalStyles.secondaryColor}>-</p>
              )}
            </div>
          </div>
        }
      />
    </BaseLayout>
  );
}
