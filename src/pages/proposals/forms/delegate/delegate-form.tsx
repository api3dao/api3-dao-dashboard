import { useState } from 'react';
import classNames from 'classnames';
import Button from '../../../../components/button/button';
import Input from '../../../../components/input/input';
import { ModalFooter, ModalHeader } from '../../../../components/modal/modal';
import { useChainData } from '../../../../chain-data';
import { useApi3Pool } from '../../../../contracts';
import { utils, constants } from 'ethers';
import { go, GO_ERROR_INDEX, GO_RESULT_INDEX, isGoSuccess } from '../../../../utils';
import * as notifications from '../../../../components/notifications/notifications';
import { messages } from '../../../../utils/messages';
import globalStyles from '../../../../styles/global-styles.module.scss';
import styles from './delegate.module.scss';
import { handleTransactionError } from '../../../../utils';

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
      return setError(messages.INVALID_DELEGATE_ADDRESS);
    }

    if (delegationAddress === userAccount) {
      return setError(messages.DELEGATE_IS_YOURSELF);
    }

    const goDelegate = await go(api3Pool.userDelegate(delegationAddress));
    if (!isGoSuccess(goDelegate)) {
      return notifications.error({
        message: messages.FAILED_TO_LOAD_DELEGATE,
        errorOrMessage: goDelegate[GO_ERROR_INDEX],
      });
    }

    const targetDelegate = goDelegate[GO_RESULT_INDEX];
    if (targetDelegate !== constants.AddressZero) {
      return setError(messages.REDELEGATION_IS_FORBIDDEN(targetDelegate));
    }

    const tx = await handleTransactionError(api3Pool.delegateVotingPower(delegationAddress));
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
          placeholder="Enter address here"
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
