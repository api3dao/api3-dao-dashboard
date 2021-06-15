import { BigNumber } from 'ethers';
import { useState } from 'react';
import { MAX_ALLOWANCE, useApi3Pool, useApi3Token } from '../../../contracts';
import { useChainData } from '../../../chain-data';
import { ModalFooter, ModalHeader } from '../../../components/modal/modal';
import Input from '../../../components/input/input';
import Button from '../../../components/button/button';
import { notifications } from '../../../components/notifications/notifications';
import {
  go,
  goSync,
  isUserRejection,
  formatApi3,
  parseApi3,
  messages,
  isGoSuccess,
  GO_RESULT_INDEX,
  GO_ERROR_INDEX,
} from '../../../utils';
import globalStyles from '../../../styles/global-styles.module.scss';
import styles from './forms.module.scss';

interface Props {
  allowance: BigNumber;
  onClose: () => void;
  walletBalance: BigNumber;
}

const TokenDepositForm = (props: Props) => {
  const { allowance, walletBalance } = props;

  const { setChainData, transactions, userAccount } = useChainData();
  const api3Token = useApi3Token();
  const api3Pool = useApi3Pool();

  const [inputValue, setInputValue] = useState('');
  const [error, setError] = useState('');

  // The input field should catch any bad inputs, but just in case, try parse and display any errors
  const [parseErr, inputBigNum] = goSync(() => parseApi3(inputValue));

  const handleApprove = async () => {
    if (!api3Pool || !api3Token) return;

    setError('');

    const goResponse = await go(api3Token.approve(api3Pool.address, MAX_ALLOWANCE));
    if (isGoSuccess(goResponse)) {
      const tx = goResponse[GO_RESULT_INDEX];
      setChainData('Save deposit approval', { transactions: [...transactions, { type: 'approve-deposit', tx }] });
    } else {
      if (isUserRejection(goResponse[GO_ERROR_INDEX])) {
        notifications.info({ message: messages.TX_APPROVAL_REJECTED });
        return;
      }
      setError(messages.TX_APPROVAL_ERROR);
      return;
    }
  };

  const handleDeposit = async () => {
    if (!api3Pool || !userAccount) return;

    if (!inputValue || inputValue === '0') {
      setError(messages.VALIDATION_INPUT_ZERO);
      return;
    }
    if (parseErr || !inputBigNum) {
      setError(messages.VALIDATION_INPUT_PARSE);
      return;
    }
    if (inputBigNum.gt(walletBalance)) {
      setError(messages.VALIDATION_DEPOSIT_TOO_HIGH);
      return;
    }

    setError('');

    const goResponse = await go(api3Pool.deposit(userAccount, parseApi3(inputValue), userAccount));
    if (isGoSuccess(goResponse)) {
      const tx = goResponse[GO_RESULT_INDEX];
      setChainData('Save deposit transaction', { transactions: [...transactions, { type: 'deposit', tx }] });
    } else {
      if (isUserRejection(goResponse[GO_ERROR_INDEX])) {
        notifications.info({ message: messages.TX_DEPOSIT_REJECTED });
        return;
      }
      setError(messages.TX_DEPOSIT_ERROR);
      return;
    }

    props.onClose();
  };

  const handleSetMax = () => setInputValue(formatApi3(walletBalance.toString()));

  if (!api3Pool || !api3Token) {
    return null;
  }

  const approvalRequired = !parseErr && !!inputBigNum && inputBigNum.gt(allowance);
  const canDeposit = !parseErr && !!inputBigNum && !approvalRequired && inputBigNum.gt(0);

  return (
    <>
      <ModalHeader>How many tokens would you like to deposit?</ModalHeader>

      <div className={globalStyles.textCenter}>
        <p className={styles.tokenAmountFormToken}>TOKEN</p>
        <div className={styles.inputWrapper}>
          <Input
            type="number"
            autosize
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            size="large"
          />
          <Button className={styles.maxButton} type="text" onClick={handleSetMax} size="normal">
            Max
          </Button>
        </div>

        {error && <p className={styles.tokenAmountFormError}>{error}</p>}

        <div className={styles.tokenDepositFormBalance}>
          Wallet balance:{' '}
          <span className={globalStyles.pointer} onClick={handleSetMax}>
            {walletBalance ? formatApi3(walletBalance) : '0.0'}
          </span>
        </div>
      </div>

      <ModalFooter>
        <div>
          <Button
            type="secondary"
            onClick={handleApprove}
            disabled={!approvalRequired}
            className={styles.tokenAmountFormApprove}
          >
            Approve
          </Button>

          <Button type="secondary" onClick={handleDeposit} disabled={!canDeposit}>
            Deposit
          </Button>
        </div>
      </ModalFooter>
    </>
  );
};

export default TokenDepositForm;
