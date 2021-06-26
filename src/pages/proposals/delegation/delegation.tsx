import { useState } from 'react';
import { abbrStr } from '../../../chain-data/helpers';
import DelegateVotesForm from '../forms/delegate/delegate-form';
import globalStyles from '../../../styles/global-styles.module.scss';
import { useChainData } from '../../../chain-data';
import Button from '../../../components/button/button';
import { Modal } from '../../../components/modal/modal';
import { canDelegateSelector, canUndelegateSelector } from '../../../logic/proposals/selectors';
import ChooseDelegateAction from '../forms/choose-delegate-action/choose-delegate-action';
import { useApi3Pool } from '../../../contracts';
import { go, isUserRejection } from '../../../utils';
import * as notifications from '../../../components/notifications/notifications';
import { images, messages } from '../../../utils';
import { useLoadDashboardData } from '../../../logic/dashboard';
import TooltipChecklist from '../../../components/tooltip/tooltip-checklist';
import styles from './delegation.module.scss';

const Delegation = () => {
  // TODO: Retrieve only "userStaked" from the chain instead of loading all staking data (and remove useLoadDashboardData call)
  const { delegation, dashboardState, setChainData, transactions, userAccount } = useChainData();
  const api3Pool = useApi3Pool();

  useLoadDashboardData();

  const [openDelegationModal, setOpenDelegationModal] = useState(false);
  const [openChooseDelegateActionModal, setOpenChooseDelegateActionModal] = useState(false);

  const canDelegate = canDelegateSelector(delegation, dashboardState);
  const canUndelegate = canUndelegateSelector(delegation);

  const delegateChecklistItems = [
    {
      checked: canDelegate?.hasStakedTokens ?? false,
      label: 'You have staked API3 tokens',
    },
    {
      checked: canDelegate?.delegationCooldownOver ?? false,
      label: "You haven't updated delegation in the last 7 days",
    },
  ];

  // The button should always be in sync with the checklist
  const delegateable = delegateChecklistItems.every((item) => item.checked);
  const undelegateable = canUndelegate?.delegationCooldownOver ?? false;

  return (
    <>
      {delegation?.delegate ? (
        <div>
          <p className={`${globalStyles.secondaryColor} ${globalStyles.bold}`}>
            Delegated to: {abbrStr(delegation.delegate)}
          </p>
          <Button
            className={styles.proposalsLink}
            type="text"
            onClick={() => setOpenChooseDelegateActionModal(true)}
            disabled={!delegateable && !undelegateable}
          >
            Update delegation
          </Button>
          <TooltipChecklist items={delegateChecklistItems}>
            <img src={images.help} alt="delegation help" className={styles.help} />
          </TooltipChecklist>
          <Modal open={openChooseDelegateActionModal} onClose={() => setOpenChooseDelegateActionModal(false)}>
            <ChooseDelegateAction
              canUpdateDelegation={delegateable}
              canUndelegate={undelegateable}
              onUndelegate={async () => {
                if (!api3Pool) return;

                const [error, tx] = await go(api3Pool.undelegateVotingPower());
                if (error) {
                  if (isUserRejection(error)) {
                    notifications.info({ message: messages.TX_GENERIC_REJECTED });
                    return;
                  }
                  notifications.error({ message: messages.TX_GENERIC_ERROR, errorOrMessage: error });
                  return;
                }

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
          <p className={`${globalStyles.secondaryColor} ${globalStyles.bold}`}>Undelegated</p>
          <Button
            className={styles.proposalsLink}
            type="text"
            onClick={() => setOpenDelegationModal(true)}
            disabled={!delegateable}
          >
            Delegate
          </Button>
          <TooltipChecklist items={delegateChecklistItems}>
            <img src={images.help} alt="delegation help" className={styles.help} />
          </TooltipChecklist>
        </div>
      )}
      <Modal open={openDelegationModal} onClose={() => setOpenDelegationModal(false)}>
        <DelegateVotesForm onClose={() => setOpenDelegationModal(false)} userAccount={userAccount} />
      </Modal>
    </>
  );
};

export default Delegation;
