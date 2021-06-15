import { BigNumber } from 'ethers';
import { ReactNode, useState } from 'react';
import classNames from 'classnames';
import { ModalFooter, ModalHeader } from '../../../components/modal/modal';
import Input from '../../../components/input/input';
import Button from '../../../components/button/button';
import { notifications } from '../../../components/notifications/notifications';
import { formatApi3, go, goSync, isUserRejection, parseApi3, messages } from '../../../utils';
import globalStyles from '../../../styles/global-styles.module.scss';
import styles from './forms.module.scss';

interface Props {
  title: string;
  action: 'Withdraw' | 'Stake' | 'Initiate Unstaking';
  onConfirm: (parsedInput: BigNumber) => Promise<any>;
  onClose: () => void;
  onChange: (input: string) => void;
  inputValue: string;
  helperText?: ReactNode;
  showTokenInput?: boolean;
  maxValue?: BigNumber;
  closeOnConfirm?: boolean;
}

const TokenAmountForm = (props: Props) => {
  const [error, setError] = useState('');
  const {
    action,
    onConfirm,
    maxValue,
    onChange,
    onClose,
    inputValue,
    helperText,
    showTokenInput = true,
    closeOnConfirm = true,
  } = props;

  // The input field should catch any bad inputs, but just in case, try parse and display any errors
  const [parseErr, inputBigNum] = goSync(() => parseApi3(inputValue));

  const handleAction = async () => {
    if (!inputValue || inputValue === '0') {
      setError(messages.VALIDATION_INPUT_ZERO);
      return;
    }
    if (parseErr || !inputBigNum) {
      setError(messages.VALIDATION_INPUT_PARSE);
      return;
    }
    if (maxValue) {
      if (inputBigNum.gt(maxValue)) {
        setError(messages.VALIDATION_INPUT_TOO_HIGH);
        return;
      }
    }
    setError('');

    const [err] = await go(onConfirm(inputBigNum));
    if (err) {
      if (isUserRejection(err)) {
        notifications.info({ message: messages.TX_GENERIC_REJECTED });
        return;
      }
      setError(messages.TX_GENERIC_ERROR);
      return;
    }

    if (closeOnConfirm) {
      onClose();
    }
  };

  const handleSetMax = () => maxValue && onChange(formatApi3(maxValue.toString()));

  return (
    <>
      <ModalHeader>{props.title}</ModalHeader>

      {showTokenInput && (
        <div className={globalStyles.textCenter}>
          <p className={styles.tokenAmountFormToken}>TOKEN</p>
          <div className={styles.inputWrapper}>
            <Input type="number" autosize value={inputValue} onChange={(e) => onChange(e.target.value)} size="large" />
            <Button className={styles.maxButton} type="text" onClick={handleSetMax}>
              Max
            </Button>
          </div>

          {error && <p className={styles.tokenAmountFormError}>{error}</p>}
          {helperText}
        </div>
      )}

      <ModalFooter>
        <div className={classNames({ [styles.tokenAmountFormActions]: !showTokenInput })}>
          {!showTokenInput && (
            <Button type="text" onClick={onClose}>
              Cancel
            </Button>
          )}
          <Button type="secondary" onClick={handleAction} disabled={!!parseErr}>
            {action}
          </Button>
        </div>
      </ModalFooter>
    </>
  );
};

export default TokenAmountForm;
