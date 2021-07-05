import { BigNumber } from 'ethers';
import { useState } from 'react';
import { ModalFooter, ModalHeader } from '../../../components/modal/modal';
import Input from '../../../components/input/input';
import Button from '../../../components/button/button';
import { formatApi3, goSync, parseApi3, messages } from '../../../utils';
import globalStyles from '../../../styles/global-styles.module.scss';
import styles from './forms.module.scss';

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
  const [parseErr, parsedInput] = goSync(() => parseApi3(inputValue));

  const handleAction = async () => {
    setError('');

    if (parseErr || !parsedInput) {
      return setError(messages.VALIDATION_INPUT_PARSE);
    }
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
