import { FormEventHandler, useState } from 'react';
import { BigNumber } from 'ethers';
import { useParams } from 'react-router';
import { BaseLayout } from '../../components/layout';
import Input from '../../components/input';
import Button from '../../components/button';
import { isEmpty } from 'lodash';
import { useChainData } from '../../chain-data';
import { useClaimsManager } from '../../contracts';
import { useUserPolicyById } from '../../logic/policies';
import { parseApi3 } from '../../utils';
import globalStyles from '../../styles/global-styles.module.scss';
import styles from './new-claim.module.scss';

interface Params {
  policyId: string;
}

interface FormState {
  evidence: string;
  amount: string;
}

function getMessages(form: FormState) {
  const messages: ValidationMessages<FormState> = {};

  if (form.evidence.trim().length === 0) {
    messages.evidence = 'This field is required';
  }

  if (form.amount.trim().length === 0) {
    messages.amount = 'This field is required';
  } else if (parseFloat(form.amount) < 0) {
    messages.amount = 'This must be greater than zero';
  }

  return messages;
}

export default function NewClaim() {
  const { policyId } = useParams<Params>();
  const { provider } = useChainData();
  const claimsManager = useClaimsManager();
  const { data: policy, status: loadStatus } = useUserPolicyById(policyId);

  const [form, setForm] = useState<FormState>({ evidence: '', amount: '' });
  const [status, setStatus] = useState<'idle' | 'validation_failed' | 'submitting' | 'submitted' | 'failed'>('idle');

  if (!provider) {
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

  const messages = getMessages(form);
  const handleSubmit: FormEventHandler = async (ev) => {
    ev.preventDefault();
    if (!isEmpty(messages)) {
      setStatus('validation_failed');
      return;
    }

    setStatus('submitting');
    // TODO Handle properly
    try {
      // @ts-ignore
      await claimsManager.createClaim(
        policy.beneficiary,
        policy.coverageAmount,
        Math.round(policy.startTime.getTime() / 1000),
        Math.round(policy.endTime.getTime() / 1000),
        policy.ipfsHash,
        BigNumber.from(parseApi3(form.amount)),
        form.evidence
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
      <h5>Submit Claim</h5>
      <form onSubmit={handleSubmit} noValidate style={{ maxWidth: '60ch' }}>
        <ol className={styles.formList}>
          <li>
            <label htmlFor="evidence">Enter the IPFS hash to your Claim Evidence form</label>
            <p>You created this hash in the previous step</p>
            <div>
              <Input
                id="evidence"
                value={form.evidence}
                onChange={(ev) => setForm({ ...form, evidence: ev.target.value })}
                block
              />
            </div>
            {showMessages && messages.evidence && <p>{messages.evidence}</p>}
          </li>
          <li>
            <label htmlFor="amount">Requested relief amount, in API3 tokens</label>
            <p>How many API3 tokens do you wish to receive?</p>
            <div>
              <Input
                id="amount"
                type="number"
                value={form.amount}
                onChange={(ev) => setForm({ ...form, amount: ev.target.value })}
              />
            </div>
            {showMessages && messages.amount && <p>{messages.amount}</p>}
          </li>
        </ol>
        <Button disabled={status === 'submitting'}>Submit Claim</Button>
      </form>
    </BaseLayout>
  );
}

type ValidationMessages<T> = { [key in keyof T]?: string };
