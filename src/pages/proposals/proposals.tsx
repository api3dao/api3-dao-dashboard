import Button from '../../components/button';
import { useChainData } from '../../chain-data';
import Layout from '../../components/layout';
import { Tooltip } from '../../components/tooltip';
import ProposalList from '../proposal-commons/proposal-list';
import { useTreasuryAndDelegation } from '../../logic/treasury-and-delegation/use-treasury-and-delegation';
import Delegation from './delegation';
import { images } from '../../utils';
import styles from './proposals.module.scss';

const Proposals = () => {
  const { provider } = useChainData();
  useTreasuryAndDelegation();

  return (
    <Layout title="Governance">
      {provider && (
        <div className={styles.governanceHeader}>
          <Delegation />
        </div>
      )}

      <div className={styles.proposalsHeader}>
        <h5>Active Proposals</h5>
        <div className={styles.newProposalButtonWrapper}>
          <Button type="secondary" size="sm" disabled className={styles.newProposalButton}>
            + New Proposal
          </Button>
          <Tooltip overlay="Make new proposals on Snapshot.">
            <img src={images.helpOutline} alt="new proposal help" />
          </Tooltip>
        </div>
      </div>
      {/* No proposals can be created anymore, so there are never active proposals */}
      <ProposalList proposals={[]} type="active" />
    </Layout>
  );
};

export default Proposals;
