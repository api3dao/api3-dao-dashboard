import { useState } from 'react';
import Button from '../../../../components/button/button';
import Input from '../../../../components/input/input';
import { ModalFooter, ModalHeader } from '../../../../components/modal/modal';
import { useChainData } from '../../../../chain-data';
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
  const { setChainData, transactions } = useChainData();

  const [error, setError] = useState('');
  const [delegationAddress, setDelegationAddress] = useState('');
  const api3Pool = useApi3Pool();

  const onDelegate = async () => {
    if (!api3Pool) return;

    if (!utils.isAddress(delegationAddress) || delegationAddress === constants.AddressZero) {
      setError(messages.INVALID_DELEGATE_ADDRESS);
      return;
    }

    if (delegationAddress === userAccount) {
      setError(messages.DELEGATE_IS_YOURSELF);
      return;
    }

    const goDelegate = await go(api3Pool.userDelegate(delegationAddress));
    if (!isGoSuccess(goDelegate)) {
      notifications.error({ message: messages.UNABLE_TO_LOAD_DELEGATE });
      return;
    }

    const targetDelegate = goDelegate[GO_RESULT_INDEX];
    if (targetDelegate !== constants.AddressZero) {
      setError(messages.REDELEGATION_IS_FORBIDDEN(targetDelegate));
      return;
    }

    const [error, tx] = await go(api3Pool.delegateVotingPower(delegationAddress));
    if (error) {
      if (isUserRejection(error)) {
        notifications.info({ message: messages.TX_GENERIC_REJECTED });
        return;
      }
      notifications.error({ message: messages.TX_GENERIC_ERROR });
    }

    if (tx) {
      setChainData('Save delegate transaction', { transactions: [...transactions, { type: 'delegate', tx }] });
    }

    onClose();
  };

  return (
    <>
      <ModalHeader>Delegate my votes to:</ModalHeader>

      <div className={globalStyles.textCenter}>
        <p className={styles.delegateVotesModalSubtitle}>ADDRESS</p>
        <Input
          type="text"
          autosize
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
        <Button type="secondary" size="large" onClick={onDelegate}>
          Delegate
        </Button>
      </ModalFooter>
    </>
  );
};

export default DelegateVotesForm;
