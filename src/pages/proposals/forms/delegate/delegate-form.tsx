import { useState } from 'react';
import classNames from 'classnames';
import Button from '../../../../components/button';
import { Input } from '../../../../components/input';
import { ModalFooter, ModalHeader } from '../../../../components/modal';
import { useChainData } from '../../../../chain-data';
import { useApi3Pool } from '../../../../contracts';
import { utils, constants } from 'ethers';
import * as notifications from '../../../../components/notifications';
import { messages } from '../../../../utils/messages';
import globalStyles from '../../../../styles/global-styles.module.scss';
import styles from './delegate.module.scss';
import { handleTransactionError } from '../../../../utils';
import { convertToAddressOrThrow } from '../../../../logic/proposals/encoding/ens-name';
import { go } from '@api3/promise-utils';

interface Props {
  onClose: () => void;
}

const DelegateVotesForm = (props: Props) => {
  const { onClose } = props;
  const { setChainData, transactions, userAccount, signer, provider } = useChainData();

  const [error, setError] = useState('');
  const [delegationAddress, setDelegationAddress] = useState('');
  const api3Pool = useApi3Pool();

  const onDelegate = async () => {
    if (!api3Pool || !provider) return;

    const goDelegationTargetResolvedName = await go(() => convertToAddressOrThrow(provider, delegationAddress));
    const delegationTarget = goDelegationTargetResolvedName.success
      ? goDelegationTargetResolvedName.data
      : delegationAddress;

    if (!utils.isAddress(delegationTarget) || delegationTarget === constants.AddressZero) {
      return setError(messages.INVALID_DELEGATE_ADDRESS);
    }

    if (delegationTarget === userAccount) {
      return setError(messages.DELEGATE_IS_YOURSELF);
    }

    const goDelegate = await go(() => api3Pool.userDelegate(delegationTarget));
    if (!goDelegate.success) {
      return notifications.error({
        message: messages.FAILED_TO_LOAD_DELEGATE,
        errorOrMessage: goDelegate.error,
      });
    }

    const targetDelegate = goDelegate.data;
    if (targetDelegate !== constants.AddressZero) {
      return setError(messages.REDELEGATION_IS_FORBIDDEN(targetDelegate));
    }

    const tx = await handleTransactionError(api3Pool.connect(signer!).delegateVotingPower(delegationTarget));
    if (tx) {
      setChainData('Save delegate transaction', { transactions: [...transactions, { type: 'delegate', tx }] });
    }

    onClose();
  };

  return (
    <>
      <ModalHeader>Delegate my votes to:</ModalHeader>

      <div className={styles.delegateFormModalContent}>
        <div className={styles.inputWrapper}>
          <Input
            type="text"
            size="small"
            placeholder="Enter address or ENS name here"
            value={delegationAddress}
            onChange={(e) => {
              setDelegationAddress(e.target.value);
              setError('');
            }}
            autoFocus
          />
        </div>

        <p className={styles.subtext}>
          You will not be able to vote on proposals while your votes are delegated. Your delegate can vote for you.
        </p>
      </div>

      <ModalFooter>
        <Button className={styles.delegateButton} type="primary" size="sm" sm={{ size: 'md' }} onClick={onDelegate}>
          Delegate
        </Button>

        {error && <p className={styles.error}>{error}</p>}
      </ModalFooter>
    </>
  );
};

export default DelegateVotesForm;
