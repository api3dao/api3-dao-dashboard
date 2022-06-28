import { FormEventHandler } from 'react';
import { goSync } from '@api3/promise-utils';
import { BigNumber, utils } from 'ethers';
import isEmpty from 'lodash/isEmpty';
import Input from '../../components/input';
import Button from '../../components/button';
import { Policy } from '../../chain-data';
import globalStyles from '../../styles/global-styles.module.scss';
import styles from './new-claim-form.module.scss';

export interface FormState {
  evidence: string;
  amount: string;
}

export type FormStatus = 'idle' | 'validation_failed' | 'submitting' | 'submitted' | 'failed';

function getValidationMessages(form: FormState, policy: Policy) {
  const messages: ValidationMessages<FormState> = {};

  if (form.evidence.trim().length === 0) {
    messages.evidence = 'Please fill in this field';
  }

  const result = goSync(() => parseClaimAmount(form.amount));
  if (!result.success) {
    messages.amount = 'Please enter a valid number';
  } else {
    const parsed = result.data;
    if (parsed.lte(0)) {
      messages.amount = 'Amount must be greater than zero';
    } else if (parsed.gt(policy.coverageAmount)) {
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
    <form onSubmit={handleSubmit} noValidate className={styles.form}>
      <ol className={styles.formList}>
        <li>
          <label htmlFor="evidence">Enter the IPFS hash to your Claim Evidence form</label>
          <p className={globalStyles.secondaryColor}>You created this hash in the previous step</p>
          <Input
            id="evidence"
            value={form.evidence}
            onChange={(ev) => onChange({ ...form, evidence: ev.target.value })}
            block
          />
          {showMessages && messages.evidence && <p className={styles.validation}>{messages.evidence}</p>}
        </li>
        <li>
          <label htmlFor="amount">Requested relief amount, in USD</label>
          <p className={globalStyles.secondaryColor}>
            How much USD do you wish to receive? (Max of ${utils.commify(policy.coverageAmount.toString())})
          </p>
          <Input
            id="amount"
            type="number"
            value={form.amount}
            onChange={(ev) => onChange({ ...form, amount: ev.target.value })}
          />
          {showMessages && messages.amount && <p className={styles.validation}>{messages.amount}</p>}
        </li>
      </ol>
      <Button type="secondary">Next</Button>
    </form>
  );
}

type ValidationMessages<T> = { [key in keyof T]?: string };

export function parseClaimAmount(amount: string) {
  return BigNumber.from(Math.round(parseFloat(amount.trim())));
}
