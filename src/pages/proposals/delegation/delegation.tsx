import { useState } from 'react';
import { abbrStr } from '../../../chain-data/helpers';
import DelegateVotesForm from '../forms/delegate/delegate-form';
import { useChainData } from '../../../chain-data';
import Button from '../../../components/button';
import { Modal } from '../../../components/modal';
import { canDelegateSelector, canUndelegateSelector } from '../../../logic/proposals/selectors';
import ChooseDelegateAction from '../forms/choose-delegate-action/choose-delegate-action';
import { useApi3Pool } from '../../../contracts';
import { handleTransactionError } from '../../../utils';
import { images } from '../../../utils';
import { TooltipChecklist } from '../../../components/tooltip';
import styles from './delegation.module.scss';
import { useWindowDimensions } from '../../../hooks/use-window-dimensions';

const Delegation = () => {
  // TODO: Retrieve only "userStaked" from the chain instead of loading all staking data (and remove useLoadDashboardData call)
  const { signer, delegation, dashboardState, setChainData, transactions } = useChainData();
  const api3Pool = useApi3Pool();
  const { isMobile } = useWindowDimensions();

  const [openDelegationModal, setOpenDelegationModal] = useState(false);
  const [openChooseDelegateActionModal, setOpenChooseDelegateActionModal] = useState(false);

  const delegate = canDelegateSelector(delegation, dashboardState);
  const undelegate = canUndelegateSelector(delegation);

  const delegateChecklistItems = [
    {
      checked: delegate?.hasStakedTokens ?? false,
      label: 'You have staked API3 tokens.',
    },
    {
      checked: delegate?.delegationCooldownOver ?? false,
      label: "You haven't updated delegation in the last 7 days.",
    },
  ];

  // The button should always be in sync with the checklist
  const canDelegate = delegateChecklistItems.every((item) => item.checked);
  const canUndelegate = undelegate?.delegationCooldownOver ?? false;

  return (
    <>
      {delegation?.delegate ? (
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
            onClick={() => setOpenChooseDelegateActionModal(true)}
            disabled={!canDelegate && !canUndelegate}
          >
            Update delegation
          </Button>
          <TooltipChecklist items={delegateChecklistItems}>
            <img src={images.helpOutline} alt="delegation help" className={styles.helpIcon} />
          </TooltipChecklist>
          <Modal open={openChooseDelegateActionModal} onClose={() => setOpenChooseDelegateActionModal(false)}>
            <ChooseDelegateAction
              canUpdateDelegation={canDelegate}
              canUndelegate={canUndelegate}
              onUndelegate={async () => {
                if (!api3Pool) return;

                const tx = await handleTransactionError(api3Pool.connect(signer!).undelegateVotingPower());
                if (tx) {
                  setChainData('Save undelegate transaction', {
                    transactions: [...transactions, { type: 'undelegate', tx }],
                  });
                }

                setOpenChooseDelegateActionModal(false);
              }}
              onUpdateDelegation={() => {
                setOpenChooseDelegateActionModal(false);
                setOpenDelegationModal(true);
              }}
            />
          </Modal>
        </div>
      ) : (
        <div>
          <p className={styles.delegatedTitle}>Undelegated</p>
          <Button
            className={styles.delegateButton}
            type="link-blue"
            size="sm"
            md={{ size: 'lg' }}
            onClick={() => setOpenDelegationModal(true)}
            disabled={!canDelegate}
          >
            Delegate
          </Button>
          <TooltipChecklist items={delegateChecklistItems}>
            <img src={images.helpOutline} alt="delegation help" className={styles.helpIcon} />
          </TooltipChecklist>
        </div>
      )}
      <Modal open={openDelegationModal} onClose={() => setOpenDelegationModal(false)}>
        <DelegateVotesForm onClose={() => setOpenDelegationModal(false)} />
      </Modal>
    </>
  );
};

export default Delegation;
