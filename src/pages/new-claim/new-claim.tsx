import { ComponentProps, useState } from 'react';
import { useParams } from 'react-router';
import { Link, Redirect } from 'react-router-dom';
import { BaseLayout } from '../../components/layout';
import ExternalLink from '../../components/external-link';
import BackButton from '../../components/back-button';
import backButtonStyles from '../../components/back-button/back-button.module.scss';
import ArrowLeftIcon from '../../components/icons/arrow-left-icon';
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
          <p>
            <span className={globalStyles.bold}>Your claim ID is: </span>
            <br />
            {newClaimId}
          </p>
          <p className={globalStyles.bold}>There will be an update in 72 hours. Please check back daily.</p>
          <p className={styles.processMessage}>
            When there is an update, you will have 72 hours to respond.
            <br />
            <ExternalLink href="https://docs.api3.org" className="link-primary">
              Read about the claim process here
            </ExternalLink>{' '}
            to familiarize yourself with the next steps.
          </p>
          <Link to="/" className={styles.homeLink}>
            Return Home
          </Link>
        </div>
      </BaseLayout>
    );
  }

  switch (step) {
    case 'instructions':
      return (
        <BaseLayout subtitle="New Claim">
          <div className={styles.backButtonRow}>
            <BackButton>Back</BackButton>
          </div>
          <h4 className={styles.heading}>New Claim</h4>
          <p className={styles.policy}>{policy.metadata}</p>
          <h5 className={styles.subHeading}>Creating Evidence</h5>
          <ClaimEvidenceInstructions onNext={() => setStep('capture')} />
        </BaseLayout>
      );

    case 'capture':
      return (
        <BaseLayout subtitle="New Claim">
          <div className={styles.backButtonRow}>
            <StepBackButton onClick={() => setStep('instructions')} />
          </div>
          <h4 className={styles.heading}>New Claim</h4>
          <p className={styles.policy}>{policy.metadata}</p>
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
          <div className={styles.backButtonRow}>
            <StepBackButton onClick={() => setStep('capture')} />
          </div>
          <h4 className={styles.heading}>New Claim</h4>
          <p className={styles.policy}>{policy.metadata}</p>
          <h5 className={styles.subHeading}>Review Your Claim</h5>
          <Confirmation form={form} onSubmit={handleSubmit} />
        </BaseLayout>
      );
  }
}

function StepBackButton(props: ComponentProps<'button'>) {
  return (
    <button className={backButtonStyles.backButton} {...props}>
      <ArrowLeftIcon />
      Back
    </button>
  );
}
