import { useState } from 'react';
import { abbrStr } from '../../../chain-data/helpers';
import DelegateVotesForm from '../forms/delegate/delegate-form';
import globalStyles from '../../../styles/global-styles.module.scss';
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
import classNames from 'classnames';

const Delegation = () => {
  // TODO: Retrieve only "userStaked" from the chain instead of loading all staking data (and remove useLoadDashboardData call)
  const { delegation, dashboardState, setChainData, transactions } = useChainData();
  const api3Pool = useApi3Pool();

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
          <p className={classNames(globalStyles.secondaryColor, globalStyles.bold)} data-cy="delegated-to">
            Delegated to: {delegation.delegateName ? delegation.delegateName : abbrStr(delegation.delegate)}
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
            <img src={images.help} alt="delegation help" className={globalStyles.helpIcon} />
          </TooltipChecklist>
          <Modal open={openChooseDelegateActionModal} onClose={() => setOpenChooseDelegateActionModal(false)}>
            <ChooseDelegateAction
              canUpdateDelegation={canDelegate}
              canUndelegate={canUndelegate}
              onUndelegate={async () => {
                if (!api3Pool) return;

                const tx = await handleTransactionError(api3Pool.undelegateVotingPower());
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
          <p className={classNames(globalStyles.secondaryColor, globalStyles.bold)}>Undelegated</p>
          <Button
            className={styles.proposalsLink}
            type="text"
            onClick={() => setOpenDelegationModal(true)}
            disabled={!canDelegate}
          >
            Delegate
          </Button>
          <TooltipChecklist items={delegateChecklistItems}>
            <img src={images.help} alt="delegation help" className={globalStyles.helpIcon} />
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
