import { BigNumber } from 'ethers';
import { useState } from 'react';
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
  maxValue?: BigNumber;
  closeOnConfirm?: boolean;
}

const TokenAmountForm = (props: Props) => {
  const [error, setError] = useState('');
  const { action, onConfirm, maxValue, onChange, onClose, inputValue, closeOnConfirm = true } = props;

  // The input field should catch any bad inputs, but just in case, try parse and display any errors
  const [parseErr, parsedInput] = goSync(() => parseApi3(inputValue));

  const handleAction = async () => {
    if (parseErr || !parsedInput) {
      setError(messages.VALIDATION_INPUT_PARSE);
      return;
    }
    if (parsedInput.lte(0)) {
      setError(messages.VALIDATION_INPUT_ZERO);
      return;
    }
    if (maxValue) {
      if (parsedInput.gt(maxValue)) {
        setError(messages.VALIDATION_INPUT_TOO_HIGH);
        return;
      }
    }
    setError('');

    const [err] = await go(onConfirm(parsedInput));
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

  const handleSetMax = () => maxValue && onChange(formatApi3(maxValue.toString(), false));

  return (
    <>
      <ModalHeader>{props.title}</ModalHeader>

      <div className={globalStyles.textCenter}>
        <div className={styles.inputWrapper}>
          <Input
            type="number"
            autosize
            value={inputValue}
            onChange={(e) => onChange(e.target.value)}
            size="large"
            autoFocus
          />
          {maxValue && (
            <Button className={styles.maxButton} type="text" onClick={handleSetMax}>
              Max
            </Button>
          )}
        </div>

        {maxValue && (
          <div className={styles.tokenFormBalance}>
            Your balance:{' '}
            <span className={globalStyles.pointer} onClick={handleSetMax}>
              {/* We don't round because we want to show all decimal digits for the maxValue field */}
              {formatApi3(maxValue)}
            </span>
          </div>
        )}
      </div>

      <ModalFooter>
        <div className={styles.tokenAmountFormActions}>
          <Button type="secondary" onClick={handleAction} disabled={!!parseErr}>
            {action}
          </Button>
        </div>

        {error && <p className={styles.tokenAmountFormError}>{error}</p>}
      </ModalFooter>
    </>
  );
};

export default TokenAmountForm;
