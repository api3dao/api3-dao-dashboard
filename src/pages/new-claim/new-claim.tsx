import { FormEventHandler, useState } from 'react';
import { useParams } from 'react-router';
import { BaseLayout } from '../../components/layout';
import Input from '../../components/input';
import Button from '../../components/button';
import { isEmpty } from 'lodash';
import { Policy } from '../../chain-data';
import { useClaimsManager } from '../../contracts';
import { useUserPolicyById } from '../../logic/policies';
import { formatApi3, parseApi3 } from '../../utils';
import globalStyles from '../../styles/global-styles.module.scss';
import styles from './new-claim.module.scss';

interface Params {
  policyId: string;
}

interface FormState {
  evidence: string;
  amount: string;
}

function getValidationMessages(form: FormState, policy: Policy) {
  const messages: ValidationMessages<FormState> = {};

  if (form.evidence.trim().length === 0) {
    messages.evidence = 'Please fill in this field';
  }

  // Don't try to parse if the user is starting to type a negative number
  if (form.amount.replace(/-/g, '').length === 0) {
    messages.amount = 'Please fill in this field';
  } else {
    try {
      const parsed = parseApi3(form.amount);
      if (parsed.lte(0)) {
        messages.amount = 'This must be greater than zero';
      } else if (parsed.gt(policy.coverageAmount)) {
        messages.amount = 'This must not exceed the coverage amount';
      }
    } catch (err) {
      messages.amount = 'Please enter a valid number';
    }
  }

  return messages;
}

export default function NewClaim() {
  const { policyId } = useParams<Params>();
  const claimsManager = useClaimsManager();
  const { data: policy, status: loadStatus } = useUserPolicyById(policyId);

  const [form, setForm] = useState<FormState>({ evidence: '', amount: '' });
  const [status, setStatus] = useState<'idle' | 'validation_failed' | 'submitting' | 'submitted' | 'failed'>('idle');

  if (!claimsManager) {
    return (
      <BaseLayout subtitle="New Claim">
        <p className={globalStyles.textCenter}>Please connect your wallet to submit a claim.</p>
      </BaseLayout>
    );
  }

  if (!policy) {
    return (
      <BaseLayout subtitle="New Claim">
        <h4 className={styles.heading}>New Claim</h4>
        {loadStatus === 'loading' && <p className={globalStyles.secondaryColor}>Loading...</p>}
        {loadStatus === 'loaded' && <p>Unable to find your policy with given id.</p>}
      </BaseLayout>
    );
  }

  const messages = getValidationMessages(form, policy);
  const handleSubmit: FormEventHandler = async (ev) => {
    ev.preventDefault();
    if (!isEmpty(messages)) {
      setStatus('validation_failed');
      return;
    }

    setStatus('submitting');
    // TODO DOA-151 Handle properly and show success screen
    try {
      await claimsManager.createClaim(
        policy.beneficiary,
        policy.coverageAmount,
        Math.round(policy.startTime.getTime() / 1000),
        Math.round(policy.endTime.getTime() / 1000),
        policy.ipfsHash,
        parseApi3(form.amount),
        form.evidence.trim()
      );

      setStatus('submitted');
    } catch (err) {
      setStatus('failed');
    }
  };

  const showMessages = status === 'validation_failed';
  return (
    <BaseLayout subtitle="New Claim">
      <h4 className={styles.heading}>New Claim</h4>
      <h5 className={styles.subHeading}>Submit Claim</h5>
      <form onSubmit={handleSubmit} noValidate className={styles.form}>
        <ol className={styles.formList}>
          <li>
            <label htmlFor="evidence">Enter the IPFS hash to your Claim Evidence form</label>
            <p className={globalStyles.secondaryColor}>You created this hash in the previous step</p>
            <Input
              id="evidence"
              value={form.evidence}
              onChange={(ev) => setForm({ ...form, evidence: ev.target.value })}
              block
            />
            {showMessages && messages.evidence && <p className={styles.validation}>{messages.evidence}</p>}
          </li>
          <li>
            <label htmlFor="amount">Requested relief amount, in API3 tokens</label>
            <p className={globalStyles.secondaryColor}>
              How many API3 tokens do you wish to receive? (Max of {formatApi3(policy.coverageAmount)} API3)
            </p>
            <Input
              id="amount"
              type="number"
              value={form.amount}
              onChange={(ev) => setForm({ ...form, amount: ev.target.value })}
            />
            {showMessages && messages.amount && <p className={styles.validation}>{messages.amount}</p>}
          </li>
        </ol>
        <Button disabled={status === 'submitting'}>Submit Claim</Button>
      </form>
    </BaseLayout>
  );
}

type ValidationMessages<T> = { [key in keyof T]?: string };
