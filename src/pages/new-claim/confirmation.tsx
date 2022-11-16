import Button from '../../components/button';
import { Acknowledgement, FormState } from './new-claim-form';
import { formatUsd, parseUsd } from '../../utils';
import styles from './confirmation.module.scss';

interface Props {
  form: FormState;
  onSubmit: () => void;
}

export default function Confirmation(props: Props) {
  const { form } = props;

  return (
    <div className={styles.container}>
      <ul className={styles.list}>
        <li>
          <p>IPFS hash to your Claim Evidence form</p>
          <p className={styles.confirmValue}>{form.evidence}</p>
        </li>
        <li>
          <p>Requested payout amount, in USD</p>
          <p className={styles.description}>
            If your claim is accepted, you will be paid the equivalent value in API3 tokens
          </p>
          <p className={styles.usdConfirmValue}>{formatUsd(parseUsd(form.amount))} USD</p>
        </li>
      </ul>
      <Acknowledgement />
      <div className={styles.buttonRow}>
        <Button onClick={props.onSubmit} className={styles.submitButton}>
          Submit Claim
        </Button>
      </div>
    </div>
  );
}
