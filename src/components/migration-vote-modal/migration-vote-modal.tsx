import { useState } from 'react';
import { useHistory, useLocation } from 'react-router-dom';
import { useChainData } from '../../chain-data';
import { Modal, ModalFooter, ModalHeader } from '../modal';
import Button from '../button';
import styles from './migration-vote-modal.module.scss';

const MIGRATION_PROPODAL_ID = 'primary-17';

export default function MigrationVoteModal() {
  const history = useHistory();
  const { pathname } = useLocation();
  // Don't show the modal if we're already on the migration proposal's page
  const [isDismissed, setIsDismissed] = useState(() => pathname.includes(MIGRATION_PROPODAL_ID));
  const { userAccount } = useChainData();

  const handleModalClose = () => {
    setIsDismissed(true);
  };

  const handleViewProposal = () => {
    handleModalClose();
    history.push(`/proposals/${MIGRATION_PROPODAL_ID}`);
  };

  return (
    <Modal open={!!userAccount && !isDismissed} onClose={handleModalClose}>
      <ModalHeader>Vote on the DAO migration proposal</ModalHeader>
      <p className={styles.description}>The DAO is voting on moving governance to Snapshot. Vote if you can.</p>
      <ModalFooter>
        <div className={styles.actions}>
          <Button type="text-blue" size="sm" sm={{ size: 'lg' }} onClick={handleModalClose}>
            Close
          </Button>
          <Button type="primary" size="sm" sm={{ size: 'lg' }} onClick={handleViewProposal}>
            View Proposal
          </Button>
        </div>
      </ModalFooter>
    </Modal>
  );
}
