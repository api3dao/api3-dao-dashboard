import { useState } from 'react';
import { abbrStr } from '../../../chain-data/helpers';
import { useChainData } from '../../../chain-data';
import Button from '../../../components/button';
import { Modal } from '../../../components/modal';
import { canUndelegateSelector } from '../../../logic/proposals/selectors';
import ConfirmUndelegateForm from '../forms/confirm-undelegate-form/confirm-undelegate-form';
import { useApi3Pool } from '../../../contracts';
import { handleTransactionError } from '../../../utils';
import { images } from '../../../utils';
import { Tooltip, TooltipChecklist } from '../../../components/tooltip';
import styles from './delegation.module.scss';
import { useWindowDimensions } from '../../../hooks/use-window-dimensions';

const Delegation = () => {
  const { signer, delegation, setChainData, transactions } = useChainData();
  const api3Pool = useApi3Pool();
  const { isMobile } = useWindowDimensions();

  const [openUndelegateModal, setOpenUndelegateModal] = useState(false);

  const undelegate = canUndelegateSelector(delegation);
  const canUndelegate = undelegate?.delegationCooldownOver ?? false;

  const undelegateChecklistItems = [
    {
      checked: canUndelegate,
      label: "You haven't delegated in the last 7 days.",
    },
  ];

  if (!delegation) {
    return <p className={styles.loading}>Loading...</p>;
  }

  return (
    <>
      {delegation.delegate ? (
        <div>
          <p data-cy="delegated-to">
            <span className={styles.delegatedTitle}>Delegated to: </span>
            <span className={styles.delegatedAddress}>
              {delegation.delegateName
                ? delegation.delegateName
                : isMobile
                  ? abbrStr(delegation.delegate)
                  : delegation.delegate}
            </span>
          </p>
          <Button
            className={styles.delegateButton}
            type="link-blue"
            size="sm"
            md={{ size: 'lg' }}
            onClick={() => setOpenUndelegateModal(true)}
            disabled={!canUndelegate}
          >
            Undelegate
          </Button>
          <TooltipChecklist items={undelegateChecklistItems}>
            <img src={images.helpOutline} alt="delegation help" className={styles.helpIcon} />
          </TooltipChecklist>
          <Modal open={openUndelegateModal} onClose={() => setOpenUndelegateModal(false)}>
            <ConfirmUndelegateForm
              onClose={() => setOpenUndelegateModal(false)}
              onConfirm={async () => {
                if (!api3Pool) return;

                const tx = await handleTransactionError(api3Pool.connect(signer!).undelegateVotingPower());
                if (tx) {
                  setChainData('Save undelegate transaction', {
                    transactions: [...transactions, { type: 'undelegate', tx }],
                  });
                }

                setOpenUndelegateModal(false);
              }}
            />
          </Modal>
        </div>
      ) : (
        <div>
          <p className={styles.delegatedTitle}>Undelegated</p>
          <Button className={styles.delegateButton} type="link-blue" size="sm" md={{ size: 'lg' }} disabled>
            Delegate
          </Button>
          <Tooltip overlay="Make new delegations on Snapshot.">
            <img src={images.helpOutline} alt="delegation help" className={styles.helpIcon} />
          </Tooltip>
        </div>
      )}
    </>
  );
};

export default Delegation;
