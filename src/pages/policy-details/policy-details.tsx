import { useHistory, useParams } from 'react-router';
import { BaseLayout } from '../../components/layout';
import { abbrStr, useChainData } from '../../chain-data';
import globalStyles from '../../styles/global-styles.module.scss';
import BorderedBox, { Header } from '../../components/bordered-box';
import { useUserPolicyById } from '../../logic/policies';
import Button from '../../components/button';
import styles from './policy-details.module.scss';

interface Params {
  policyId: string;
}

export default function PolicyDetails() {
  const { policyId } = useParams<Params>();
  const { provider } = useChainData();
  const history = useHistory();
  const { data: policy, status } = useUserPolicyById(policyId);

  if (!provider) {
    return (
      <BaseLayout subtitle={`Policy ${policyId}`}>
        <p className={globalStyles.textCenter}>Please connect your wallet to see the policy details.</p>
      </BaseLayout>
    );
  }

  if (!policy) {
    return (
      <BaseLayout subtitle={`Policy ${policyId}`}>
        <h4 className={styles.heading}>Policy {abbrStr(policyId)}</h4>
        {status === 'loading' && <p className={globalStyles.secondaryColor}>Loading...</p>}
        {status === 'loaded' && <p>Unable to find your policy with given id.</p>}
      </BaseLayout>
    );
  }

  return (
    <BaseLayout subtitle={`Policy ${policyId}`}>
      <h4 className={styles.heading}>Policy {abbrStr(policy.policyId)}</h4>
      <BorderedBox
        noMobileBorders
        header={
          <Header>
            <h5>Details</h5>
            <Button
              size="large"
              onClick={() => {
                history.push(`/policies/${policy.policyId}/claims/new`);
              }}
            >
              + Create a Claim
            </Button>
          </Header>
        }
        content={
          <div>
            <p>TODO</p>
            <pre>{JSON.stringify(policy, null, 2)}</pre>
          </div>
        }
      />
    </BaseLayout>
  );
}
