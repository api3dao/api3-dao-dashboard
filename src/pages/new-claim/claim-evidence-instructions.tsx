import Button from '../../components/button';
import ExternalLink from '../../components/external-link';
import styles from './claim-evidence-instructions.module.scss';

interface Props {
  onNext: () => void;
}

export default function ClaimEvidenceInstructions(props: Props) {
  return (
    <div className={styles.container}>
      <p>Your claim must include the following:</p>
      <ul className={styles.terms}>
        <li>
          a) Show a direct connection between the usage of your subscribed data feed and the claimed malfunction,
          including on-chain evidence of affected transactions
        </li>
        <li>b) Show permanent damages or losses caused by the malfunction</li>
        <li>c) Calculation method of claimed relief amount</li>
      </ul>
      <p>
        Please also note that your claim information linked within the claim cannot be altered after submission, and all
        supporting evidence presented must be pinned on IPFS and publicly available at the time of Claim submission
        until the Claim proceedings are concluded and the coverage policy reaches its end time.{' '}
        <ExternalLink href="https://docs.google.com">
          Refer to the full claim submission template for more information
        </ExternalLink>
        .
      </p>
      <div className={styles.instructionsContainer}>
        <ol className={styles.instructions}>
          <li>
            <p>
              Make a copy or download the{' '}
              <ExternalLink href="https://docs.google.com">Service Coverage Claim Submission Template</ExternalLink>
            </p>
            <p>This document contains all the details you will need to submit your claim evidence</p>
          </li>
          <li>
            <p>Upload completed Claim Evidence Form to IPFS</p>
            <p>
              You will need the resulting hash in the next step. Need help uploading something to IPFS?{' '}
              <ExternalLink href="https://docs.ipfs.io">Read the docs here</ExternalLink>
            </p>
          </li>
        </ol>
        <Button variant="secondary" onClick={props.onNext}>
          Next
        </Button>
      </div>
    </div>
  );
}
