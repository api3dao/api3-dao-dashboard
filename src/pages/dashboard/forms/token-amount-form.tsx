import { BigNumber } from 'ethers';
import { useState } from 'react';
import { ModalFooter, ModalHeader } from '../../../components/modal';
import Input from '../../../components/input';
import Button from '../../../components/button';
import { formatApi3, parseApi3, messages } from '../../../utils';
import globalStyles from '../../../styles/global-styles.module.scss';
import styles from './forms.module.scss';
import UnstakeHelperText from './unstake-helper-text';
import { goSync } from '@api3/promise-utils';

interface Props {
  title: string;
  action: 'Withdraw' | 'Stake' | 'Initiate Unstaking';
  onConfirm: (parsedInput: BigNumber) => void;
  onChange: (input: string) => void;
  inputValue: string;
  maxValue?: BigNumber;
}

const TokenAmountForm = (props: Props) => {
  const [error, setError] = useState('');
  const { action, onConfirm, maxValue, onChange, inputValue } = props;

  // The input field should catch any bad inputs, but just in case, try parse and display any errors
  const goParseApi3 = goSync(() => parseApi3(inputValue));

  const handleAction = async () => {
    setError('');

    if (!goParseApi3.success) {
      return setError(messages.VALIDATION_INPUT_PARSE);
    }
    const parsedInput = goParseApi3.data;

    if (parsedInput.lte(0)) {
      return setError(messages.VALIDATION_INPUT_ZERO);
    }
    if (maxValue) {
      if (parsedInput.gt(maxValue)) {
        return setError(messages.VALIDATION_INPUT_TOO_HIGH);
      }
    }

    onConfirm(parsedInput);
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
            <Button className={styles.maxButton} variant="text" onClick={handleSetMax}>
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
          <Button variant="secondary" onClick={handleAction} disabled={!goParseApi3.success}>
            {action}
          </Button>
        </div>

        {action === 'Stake' && <UnstakeHelperText type="basic" />}
        {error && <p className={styles.tokenAmountFormError}>{error}</p>}
      </ModalFooter>
    </>
  );
};

export default TokenAmountForm;
