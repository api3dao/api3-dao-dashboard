import { go, goSync } from '@api3/promise-utils';
import type { BigNumber } from 'ethers';
import { useState } from 'react';

import { useChainData } from '../../../chain-data';
import Button from '../../../components/button';
import Input from '../../../components/input';
import { ModalFooter, ModalHeader } from '../../../components/modal';
import { notifications } from '../../../components/notifications';
import { MAX_ALLOWANCE, useApi3Pool, useApi3Token } from '../../../contracts';
import globalStyles from '../../../styles/global-styles.module.scss';
import { isUserRejection, formatApi3, parseApi3, messages, UNKNOWN_NUMBER } from '../../../utils';

import styles from './forms.module.scss';
import UnstakeHelperText from './unstake-helper-text';

interface Props {
  allowance: BigNumber;
  onClose: () => void;
  walletBalance: BigNumber;
}

const TokenDepositForm = (props: Props) => {
  const { allowance, walletBalance, onClose } = props;

  const { signer, setChainData, transactions, userAccount } = useChainData();
  const api3Token = useApi3Token();
  const api3Pool = useApi3Pool();

  const [inputValue, setInputValue] = useState('');
  const [error, setError] = useState('');

  // The input field should catch any bad inputs, but just in case, try parse and display any errors
  const goParseApi3 = goSync(() => parseApi3(inputValue));

  const handleApprove = async () => {
    if (!api3Pool || !api3Token) return;

    setError('');

    const goResponse = await go(async () => api3Token.connect(signer!).approve(api3Pool.address, MAX_ALLOWANCE));
    if (goResponse.success) {
      const tx = goResponse.data;
      setChainData('Save deposit approval', { transactions: [...transactions, { type: 'approve-deposit', tx }] });
    } else {
      if (isUserRejection(goResponse.error)) {
        return notifications.info({ message: messages.TX_APPROVAL_REJECTED });
      }
      setError(messages.TX_APPROVAL_ERROR);
      return;
    }
  };

  const handleDeposit = (type: 'deposit-and-stake' | 'deposit-only') => async () => {
    if (!api3Pool || !userAccount) return;

    if (!goParseApi3.success) {
      setError(messages.VALIDATION_INPUT_PARSE);
      return;
    }
    const parsedInput = goParseApi3.data;

    if (parsedInput.lte(0)) {
      setError(messages.VALIDATION_INPUT_ZERO);
      return;
    }
    if (parsedInput.gt(walletBalance)) {
      setError(messages.VALIDATION_DEPOSIT_TOO_HIGH);
      return;
    }

    setError('');

    const methodName = type === 'deposit-only' ? 'depositRegular' : 'depositAndStake';
    const goResponse = await go(async () => api3Pool.connect(signer!)[methodName](parsedInput));
    if (goResponse.success) {
      const tx = goResponse.data;
      setChainData(`Save "${type}" transaction`, { transactions: [...transactions, { type, tx }] });
    } else {
      if (isUserRejection(goResponse.error)) {
        return notifications.info({ message: messages.TX_DEPOSIT_REJECTED });
      }
      setError(messages.TX_DEPOSIT_ERROR);
      return;
    }

    onClose();
  };

  const handleSetMax = () => walletBalance && setInputValue(formatApi3(walletBalance.toString(), false));

  if (!api3Pool || !api3Token) {
    return null;
  }

  const approvalRequired = goParseApi3.success && !!goParseApi3.data && goParseApi3.data.gt(allowance);
  const canDeposit = goParseApi3.success && !!goParseApi3.data && !approvalRequired && goParseApi3.data.gt(0);

  return (
    <>
      <ModalHeader>How many tokens would you like to deposit?</ModalHeader>

      <div className={globalStyles.textCenter}>
        <div className={styles.inputWrapper}>
          <Input
            type="number"
            autosize
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            size="large"
            autoFocus
          />
          <Button className={styles.maxButton} type="text" onClick={handleSetMax} size="normal">
            Max
          </Button>
        </div>

        <div className={styles.tokenFormBalance}>
          Your balance:{' '}
          <span className={globalStyles.pointer} onClick={handleSetMax}>
            {walletBalance ? formatApi3(walletBalance) : UNKNOWN_NUMBER}
          </span>
        </div>
      </div>

      <ModalFooter>
        <div className={styles.tokenAmountFormActions}>
          {approvalRequired ? (
            <Button type="secondary" onClick={handleApprove} className={styles.tokenAmountFormApprove}>
              Approve
            </Button>
          ) : (
            <Button
              type="link"
              className={styles.tokenAmountFormApprove}
              onClick={handleDeposit('deposit-only')}
              disabled={!canDeposit}
            >
              Deposit
            </Button>
          )}

          <Button type="secondary" onClick={handleDeposit('deposit-and-stake')} disabled={!canDeposit}>
            Deposit and Stake
          </Button>
        </div>

        <UnstakeHelperText type="basic" />
        {error && <p className={styles.tokenAmountFormError}>{error}</p>}
      </ModalFooter>
    </>
  );
};

export default TokenDepositForm;
