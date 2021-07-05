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
  UNKNOWN_NUMBER,
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
  const [parseErr, parsedInput] = goSync(() => parseApi3(inputValue));

  const handleApprove = async () => {
    if (!api3Pool || !api3Token) return;

    setError('');

    const goResponse = await go(api3Token.approve(api3Pool.address, MAX_ALLOWANCE));
    if (isGoSuccess(goResponse)) {
      const tx = goResponse[GO_RESULT_INDEX];
      setChainData('Save deposit approval', { transactions: [...transactions, { type: 'approve-deposit', tx }] });
    } else {
      if (isUserRejection(goResponse[GO_ERROR_INDEX])) {
        return notifications.info({ message: messages.TX_APPROVAL_REJECTED });
      }
      return setError(messages.TX_APPROVAL_ERROR);
    }
  };

  const handleDeposit = (type: 'deposit-only' | 'deposit-and-stake') => async () => {
    if (!api3Pool || !userAccount) return;

    if (parseErr || !parsedInput) {
      return setError(messages.VALIDATION_INPUT_PARSE);
    }
    if (parsedInput.lte(0)) {
      return setError(messages.VALIDATION_INPUT_ZERO);
    }
    if (parsedInput.gt(walletBalance)) {
      return setError(messages.VALIDATION_DEPOSIT_TOO_HIGH);
    }

    setError('');

    const methodName = type === 'deposit-only' ? 'depositRegular' : 'depositAndStake';
    const goResponse = await go(api3Pool[methodName](parsedInput));
    if (isGoSuccess(goResponse)) {
      const tx = goResponse[GO_RESULT_INDEX];
      setChainData(`Save "${type}" transaction`, { transactions: [...transactions, { type, tx }] });
    } else {
      if (isUserRejection(goResponse[GO_ERROR_INDEX])) {
        return notifications.info({ message: messages.TX_DEPOSIT_REJECTED });
      }
      return setError(messages.TX_DEPOSIT_ERROR);
    }

    props.onClose();
  };

  const handleSetMax = () => walletBalance && setInputValue(formatApi3(walletBalance.toString(), false));

  if (!api3Pool || !api3Token) {
    return null;
  }

  const approvalRequired = !parseErr && !!parsedInput && parsedInput.gt(allowance);
  const canDeposit = !parseErr && !!parsedInput && !approvalRequired && parsedInput.gt(0);

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

        {error && <p className={styles.tokenAmountFormError}>{error}</p>}
      </ModalFooter>
    </>
  );
};

export default TokenDepositForm;
