import { FormEventHandler } from 'react';
import { goSync } from '@api3/promise-utils';
import { CID } from 'multiformats/cid';
import isEmpty from 'lodash/isEmpty';
import Input from '../../components/input';
import UsdInput from '../../components/usd-input';
import Button from '../../components/button';
import { Policy } from '../../chain-data';
import { formatUsd, parseUsd } from '../../utils';
import styles from './new-claim-form.module.scss';

export interface FormState {
  evidence: string;
  amount: string;
}

export type FormStatus = 'idle' | 'validation_failed' | 'submitting' | 'submitted' | 'failed';

function getValidationMessages(form: FormState, policy: Policy) {
  const messages: ValidationMessages<FormState> = {};

  const evidenceResult = goSync(() => CID.parse(form.evidence.trim()));
  if (!evidenceResult.success) {
    messages.evidence = 'Please enter a valid hash';
  }

  const usdResult = goSync(() => parseUsd(form.amount));
  if (!usdResult.success) {
    messages.amount = 'Please enter a valid number';
  } else {
    const parsed = usdResult.data;
    if (parsed.lte(0)) {
      messages.amount = 'Amount must be greater than zero';
    } else if (parsed.gt(policy.remainingCoverageInUsd)) {
      messages.amount = 'Amount must not exceed the coverage amount';
    }
  }

  return messages;
}

interface Props {
  form: FormState;
  onChange: (newState: FormState) => void;
  status: FormStatus;
  policy: Policy;
  onValidationFailed: () => void;
  onNext: () => void;
}

export default function NewClaimForm(props: Props) {
  const { form, status, onChange, policy } = props;

  const messages = getValidationMessages(form, policy);
  const handleSubmit: FormEventHandler = (ev) => {
    ev.preventDefault();
    if (!isEmpty(messages)) {
      props.onValidationFailed();
    } else {
      props.onNext();
    }
  };

  const showMessages = status === 'validation_failed';
  return (
    <form onSubmit={handleSubmit} noValidate className={styles.container}>
      <ol className={styles.fieldList}>
        <li>
          <label htmlFor="evidence">Enter the IPFS hash to your Claim Evidence form</label>
          <p className={styles.description}>You created this hash in the previous step</p>
          <Input
            id="evidence"
            value={form.evidence}
            onChange={(ev) => onChange({ ...form, evidence: ev.target.value })}
            placeholder="e.g. QmPK1s3pNYLi9ERiq3BDxKa4XosgWwFRQUydHUtz4YgpqB"
            block
          />
          {showMessages && messages.evidence && (
            <p data-testid="evidence-error" className={styles.validation}>
              {messages.evidence}
            </p>
          )}
        </li>
        <li data-testid="usd-amount-field">
          <label htmlFor="amount">Requested payout amount, in USD</label>
          <p className={styles.description}>
            If your claim is accepted, you will be paid the equivalent value in API3 tokens
          </p>
          <div className={styles.usdInput}>
            <UsdInput id="amount" value={form.amount} onValueChange={(amount) => onChange({ ...form, amount })} />
          </div>
          {showMessages && messages.amount && (
            <p data-testid="usd-amount-error" className={styles.validation}>
              {messages.amount}
            </p>
          )}
          <p className={styles.helpText}>You can claim up to {formatUsd(policy.remainingCoverageInUsd)} USD</p>
        </li>
      </ol>
      <Acknowledgement />
      <div className={styles.buttonRow}>
        <Button variant="primary" className={styles.nextButton}>
          Next
        </Button>
      </div>
    </form>
  );
}

export function Acknowledgement() {
  return (
    <p className={styles.acknowledgement}>
      Claimant represents that the requested relief amount is commensurate with direct quantifiable permanent damages
      (objectively calculated “make-whole” amounts) at the time of the claimed event to the Claimant from, or direct
      contractual privity with, the affected protocol, application, smart contract, or entity directly affected by the
      claimed material malfunction.
    </p>
  );
}

type ValidationMessages<T> = { [key in keyof T]?: string };
