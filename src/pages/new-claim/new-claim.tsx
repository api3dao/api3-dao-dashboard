import { useState } from 'react';
import { useParams } from 'react-router';
import { Redirect } from 'react-router-dom';
import { BaseLayout } from '../../components/layout';
import Button from '../../components/button';
import NewClaimForm, { FormState, FormStatus, parseClaimAmount } from './new-claim-form';
import Confirmation from './confirmation';
import { CreatedClaimEvent } from '../../contracts/tmp/ClaimsManagerWithKlerosArbitrator';
import { handleTransactionError } from '../../utils';
import { useChainData } from '../../chain-data';
import { useClaimsManager } from '../../contracts';
import { useUserPolicyById, canCreateClaim } from '../../logic/policies';
import globalStyles from '../../styles/global-styles.module.scss';
import styles from './new-claim.module.scss';

interface Params {
  policyId: string;
}

export default function NewClaim() {
  const { policyId } = useParams<Params>();
  const [step, setStep] = useState<'instructions' | 'capture' | 'confirmation'>('instructions');

  const { setChainData, transactions } = useChainData();
  const claimsManager = useClaimsManager();
  const { data: policy, status: loadStatus } = useUserPolicyById(policyId);

  const [form, setForm] = useState<FormState>({ evidence: '', amount: '' });
  const [status, setStatus] = useState<FormStatus>('idle');
  const [newClaimId, setNewClaimId] = useState<null | string>(null);

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

  if (!canCreateClaim(policy)) {
    return <Redirect to={'/policies/' + policy.policyId} />;
  }

  const handleSubmit = async () => {
    setStatus('submitting');
    const tx = await handleTransactionError(
      claimsManager.createClaim(
        policy.beneficiary,
        policy.coverageAmount,
        Math.round(policy.startTime.getTime() / 1000),
        Math.round(policy.endTime.getTime() / 1000),
        policy.ipfsHash,
        parseClaimAmount(form.amount),
        form.evidence.trim()
      )
    );

    if (tx) {
      setChainData('Save create claim transaction', {
        transactions: [...transactions, { type: 'create-claim', tx }],
      });
      const receipt = await tx.wait();
      const event = receipt.events?.find((ev) => ev.event === 'CreatedClaim') as CreatedClaimEvent;
      setNewClaimId(event?.args.claimIndex.toString());
      setStatus('submitted');
    } else {
      setStatus('failed');
    }
  };

  if (status === 'submitted') {
    return (
      <BaseLayout subtitle="New Claim">
        <p>Success TODO</p>
        <p>Claim ID: {newClaimId}</p>
      </BaseLayout>
    );
  }

  switch (step) {
    case 'instructions':
      return (
        <BaseLayout subtitle="New Claim">
          <h4 className={styles.heading}>New Claim</h4>
          <h5 className={styles.subHeading}>Creating Evidence</h5>
          <p>TODO</p>
          <Button onClick={() => setStep('capture')}>Next</Button>
        </BaseLayout>
      );

    case 'capture':
      return (
        <BaseLayout subtitle="New Claim">
          <h4 className={styles.heading}>New Claim</h4>
          <h5 className={styles.subHeading}>Enter Claim Details</h5>
          <NewClaimForm
            form={form}
            onChange={setForm}
            status={status}
            policy={policy}
            onValidationFailed={() => setStatus('validation_failed')}
            onNext={() => setStep('confirmation')}
          />
        </BaseLayout>
      );

    case 'confirmation':
      return (
        <BaseLayout subtitle="New Claim">
          <h4 className={styles.heading}>New Claim</h4>
          <h5 className={styles.subHeading}>Review Your Claim</h5>
          <Confirmation form={form} policy={policy} onSubmit={handleSubmit} onCancel={() => setStep('capture')} />
        </BaseLayout>
      );
  }
}
