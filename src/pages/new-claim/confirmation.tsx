import { utils } from 'ethers';
import Button from '../../components/button';
import { Acknowledgement, FormState } from './new-claim-form';
import globalStyles from '../../styles/global-styles.module.scss';
import styles from './new-claim-form.module.scss';

interface Props {
  form: FormState;
  onSubmit: () => void;
  onCancel: () => void;
}

export default function Confirmation(props: Props) {
  const { form } = props;

  return (
    <div className={styles.container}>
      <ol className={styles.fieldList}>
        <li>
          <p>Enter the IPFS hash to your Claim Evidence form</p>
          <p className={globalStyles.secondaryColor}>You created this hash in the previous step</p>
          <p className={styles.confirmValue}>{form.evidence}</p>
        </li>
        <li>
          <p>Requested payout amount, in USD</p>
          <p className={globalStyles.secondaryColor}>
            If your claim is approved, you will be paid the equivalent value in API3 tokens
          </p>
          <p className={styles.confirmValue}>${utils.commify(form.amount)}</p>
        </li>
      </ol>
      <Acknowledgement />
      <div className={styles.buttonRow}>
        <Button onClick={props.onSubmit}>Submit Claim</Button>
        <Button variant="text" onClick={props.onCancel}>
          Go Back
        </Button>
      </div>
    </div>
  );
}
