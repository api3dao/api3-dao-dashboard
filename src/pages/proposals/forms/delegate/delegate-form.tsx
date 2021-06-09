import { useState } from 'react';
import Button from '../../../../components/button/button';
import Input from '../../../../components/input/input';
import { ModalFooter, ModalHeader } from '../../../../components/modal/modal';
import { useApi3Pool } from '../../../../contracts';
import globalStyles from '../../../../styles/global-styles.module.scss';
import styles from './delegate.module.scss';
import { utils, constants } from 'ethers';
import { go, GO_RESULT_INDEX, isGoSuccess, isUserRejection } from '../../../../utils';
import * as notifications from '../../../../components/notifications/notifications';
import { messages } from '../../../../utils/messages';

interface Props {
  onClose: () => void;
  userAccount: string;
}

const DelegateVotesForm = (props: Props) => {
  const { onClose, userAccount } = props;

  const [error, setError] = useState('');
  const [delegationAddress, setDelegationAddress] = useState('');
  const api3Pool = useApi3Pool();

  return (
    <>
      <ModalHeader>Delegate my votes to:</ModalHeader>

      <div className={globalStyles.textCenter}>
        <p className={styles.delegateVotesModalSubtitle}>ADDRESS</p>
        <Input
          type="autosize-text"
          placeholder="Enter address here"
          value={delegationAddress}
          onChange={(e) => {
            setDelegationAddress(e.target.value);
            setError('');
          }}
        />
        {error && <p className={styles.error}>{error}</p>}
      </div>

      <ModalFooter>
        <Button
          type="secondary"
          size="large"
          onClick={async () => {
            if (!api3Pool) return;

            if (!utils.isAddress(delegationAddress) || delegationAddress === constants.AddressZero) {
              setError(messages.INVALID_DELEGATE_ADDRESS);
            } else if (delegationAddress === userAccount) {
              setError(messages.DELEGATE_IS_YOURSELF);
            } else {
              const goDelegate = await go(api3Pool.getUserDelegate(delegationAddress));
              if (!isGoSuccess(goDelegate)) {
                notifications.error(messages.UNABLE_TO_LOAD_DELEGATE);
                return;
              }

              const targetDelegate = goDelegate[GO_RESULT_INDEX];
              if (targetDelegate !== constants.AddressZero) {
                setError(messages.REDELEGATION_IS_FORBIDDEN(targetDelegate));
              } else {
                const [error] = await go(api3Pool.delegateVotingPower(delegationAddress));
                if (error) {
                  if (isUserRejection(error)) {
                    notifications.info(messages.TX_GENERIC_REJECTED);
                    return;
                  }

                  notifications.error(messages.TX_GENERIC_ERROR);
                }

                onClose();
              }
            }
          }}
        >
          Delegate
        </Button>
      </ModalFooter>
    </>
  );
};

export default DelegateVotesForm;
