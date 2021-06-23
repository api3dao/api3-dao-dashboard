import { useState } from 'react';
import { abbrStr } from '../../../chain-data/helpers';
import DelegateVotesForm from '../forms/delegate/delegate-form';
import globalStyles from '../../../styles/global-styles.module.scss';
import { useChainData } from '../../../chain-data';
import Button from '../../../components/button/button';
import { Modal } from '../../../components/modal/modal';
import { delegationCooldownOverSelector } from '../../../logic/proposals/selectors';
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

  // TODO: Merge into bigger selector
  const delegationCooldownOver = delegationCooldownOverSelector(delegation);
  const canDelegate = delegationCooldownOver && (dashboardState?.userStaked.gt(0) ?? false);
  const canUndelegate = delegationCooldownOver;

  // TODO: how are these checked values calculated?
  const delegateChecklistItems = [
    {
      alt: 'Undelegate cooldown',
      checked: delegationCooldownOver,
      label: 'You undelegated your last delegation more than 7 days ago.',
    },
    {
      alt: 'Voted cooldown',
      checked: delegationCooldownOver,
      label: "You haven't voted in the last 7 days.",
    },
    {
      alt: 'Initiated proposal cooldown',
      checked: delegationCooldownOver,
      label: "You haven't made any proposals within the last 7 days.",
    },
  ];

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
            disabled={!canDelegate && !canUndelegate}
          >
            Update delegation
          </Button>
          <TooltipChecklist items={delegateChecklistItems}>
            <img src={images.help} alt="delgation help" className={styles.help} />
          </TooltipChecklist>
          <Modal open={openChooseDelegateActionModal} onClose={() => setOpenChooseDelegateActionModal(false)}>
            <ChooseDelegateAction
              canUpdateDelegation={canDelegate}
              canUndelegate={canUndelegate}
              onUndelegate={async () => {
                if (!api3Pool) return;

                const [error, tx] = await go(api3Pool.undelegateVotingPower());
                if (error) {
                  if (isUserRejection(error)) {
                    notifications.info({ message: messages.TX_GENERIC_REJECTED });
                    return;
                  }
                  notifications.error({ message: messages.TX_GENERIC_ERROR });
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
            disabled={!canDelegate}
          >
            Delegate
          </Button>
          <TooltipChecklist items={delegateChecklistItems}>
            <img src={images.help} alt="delgation help" className={styles.help} />
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
