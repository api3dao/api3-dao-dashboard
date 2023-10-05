import { go } from '@api3/promise-utils';
import classNames from 'classnames';
import { utils, constants } from 'ethers';
import { useState } from 'react';

import { useChainData } from '../../../../chain-data';
import Button from '../../../../components/button';
import Input from '../../../../components/input';
import { ModalFooter, ModalHeader } from '../../../../components/modal';
import * as notifications from '../../../../components/notifications';
import { useApi3Pool } from '../../../../contracts';
import { convertToAddressOrThrow } from '../../../../logic/proposals/encoding/ens-name';
import globalStyles from '../../../../styles/global-styles.module.scss';
import { handleTransactionError } from '../../../../utils';
import { messages } from '../../../../utils/messages';

import styles from './delegate.module.scss';

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

    const goDelegationTargetResolvedName = await go(async () => convertToAddressOrThrow(provider, delegationAddress));
    const delegationTarget = goDelegationTargetResolvedName.success
      ? goDelegationTargetResolvedName.data
      : delegationAddress;

    if (!utils.isAddress(delegationTarget) || delegationTarget === constants.AddressZero) {
      setError(messages.INVALID_DELEGATE_ADDRESS);
      return;
    }

    if (delegationTarget === userAccount) {
      setError(messages.DELEGATE_IS_YOURSELF);
      return;
    }

    const goDelegate = await go(async () => api3Pool.userDelegate(delegationTarget));
    if (!goDelegate.success) {
      return notifications.error({
        message: messages.FAILED_TO_LOAD_DELEGATE,
        errorOrMessage: goDelegate.error,
      });
    }

    const targetDelegate = goDelegate.data;
    if (targetDelegate !== constants.AddressZero) {
      setError(messages.REDELEGATION_IS_FORBIDDEN(targetDelegate));
      return;
    }

    const tx = await handleTransactionError(api3Pool.connect(signer).delegateVotingPower(delegationTarget));
    if (tx) {
      setChainData('Save delegate transaction', { transactions: [...transactions, { type: 'delegate', tx }] });
    }

    onClose();
  };

  return (
    <>
      <ModalHeader>Delegate my votes to:</ModalHeader>

      <div className={globalStyles.textCenter}>
        <Input
          type="text"
          autosize
          placeholder="Enter address or ENS name here"
          value={delegationAddress}
          onChange={(e) => {
            setDelegationAddress(e.target.value);
            setError('');
          }}
          autoFocus
        />

        <div className={classNames(globalStyles.textNormal, styles.subtext)}>
          You will not be able to vote on proposals while your votes are delegated. Your delegate can vote for you.
        </div>
      </div>

      <ModalFooter>
        <Button type="secondary" size="large" onClick={onDelegate}>
          Delegate
        </Button>

        {error && <p className={styles.error}>{error}</p>}
      </ModalFooter>
    </>
  );
};

export default DelegateVotesForm;
