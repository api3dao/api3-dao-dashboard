import { goSync } from '@api3/promise-utils';
import type { BigNumber } from 'ethers';
import { useState } from 'react';

import Button from '../../../components/button';
import Input from '../../../components/input';
import { ModalFooter, ModalHeader } from '../../../components/modal';
import globalStyles from '../../../styles/global-styles.module.scss';
import { formatApi3, parseApi3, messages } from '../../../utils';

import styles from './forms.module.scss';
import UnstakeHelperText from './unstake-helper-text';

interface Props {
  title: string;
  action: 'Initiate Unstaking' | 'Stake' | 'Withdraw';
  onConfirm: (parsedInput: BigNumber) => void;
  onChange: (input: string) => void;
  inputValue: string;
  maxValue?: BigNumber;
}

const TokenAmountForm = (props: Props) => {
  const [error, setError] = useState('');
  const { action, onConfirm, maxValue, onChange, inputValue, title } = props;

  // The input field should catch any bad inputs, but just in case, try parse and display any errors
  const goParseApi3 = goSync(() => parseApi3(inputValue));

  const handleAction = () => {
    setError('');

    if (!goParseApi3.success) {
      setError(messages.VALIDATION_INPUT_PARSE);
      return;
    }
    const parsedInput = goParseApi3.data;

    if (parsedInput.lte(0)) {
      setError(messages.VALIDATION_INPUT_ZERO);
      return;
    }
    if (maxValue && parsedInput.gt(maxValue)) {
      setError(messages.VALIDATION_INPUT_TOO_HIGH);
      return;
    }

    onConfirm(parsedInput);
  };

  const handleSetMax = () => maxValue && onChange(formatApi3(maxValue.toString(), false));

  return (
    <>
      <ModalHeader>{title}</ModalHeader>

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
          <Button type="secondary" onClick={handleAction} disabled={!goParseApi3.success}>
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
