import { useState } from 'react';
import { useParams } from 'react-router';
import { Link, Redirect } from 'react-router-dom';
import { BaseLayout } from '../../components/layout';
import ClaimEvidenceInstructions from './claim-evidence-instructions';
import NewClaimForm, { FormState, FormStatus } from './new-claim-form';
import Confirmation from './confirmation';
import { CreatedClaimEvent } from '../../contracts/tmp/ClaimsManager';
import { handleTransactionError } from '../../utils';
import { useChainData } from '../../chain-data';
import { useClaimsManager } from '../../contracts';
import { useUserPolicyById, canCreateClaim } from '../../logic/policies';
import { parseUsd } from '../../utils';
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
        Math.round(policy.claimsAllowedFrom.getTime() / 1000),
        policy.ipfsHash,
        parseUsd(form.amount),
        form.evidence.trim()
      )
    );

    if (tx) {
      setChainData('Save create claim transaction', {
        transactions: [...transactions, { type: 'create-claim', tx }],
      });
      const receipt = await tx.wait();
      const event = receipt.events?.find((ev) => ev.event === 'CreatedClaim') as CreatedClaimEvent;
      setNewClaimId(event?.args.claimHash);
      setStatus('submitted');
    } else {
      setStatus('failed');
    }
  };

  if (status === 'submitted') {
    return (
      <BaseLayout subtitle="New Claim">
        <div className={styles.successContainer}>
          <h5 className={styles.subHeading}>Thank you for submitting your claim</h5>
          <p className={globalStyles.bold}>Your claim ID is: {newClaimId}</p>
          <p className={styles.processMessage}>
            Your claim is being processed and will be voted on within 72 hours. Please check back for any updates and{' '}
            <a href="https://docs.api3.org" target="_blank" rel="noopener noreferrer">
              read about the claim process here
            </a>{' '}
            to familiarize yourself with the next steps.
          </p>
          <Link to="/">Return Home</Link>
        </div>
      </BaseLayout>
    );
  }

  switch (step) {
    case 'instructions':
      return (
        <BaseLayout subtitle="New Claim">
          <h4 className={styles.heading}>New Claim</h4>
          <h5 className={styles.subHeading}>Creating Evidence</h5>
          <ClaimEvidenceInstructions onNext={() => setStep('capture')} />
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
          <Confirmation form={form} onSubmit={handleSubmit} onCancel={() => setStep('capture')} />
        </BaseLayout>
      );
  }
}
