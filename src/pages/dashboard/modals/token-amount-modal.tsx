import { BigNumber } from 'ethers';
import { ReactNode, useState } from 'react';
import classNames from 'classnames';
import Modal from '../../../components/modal/modal';
import Input from '../../../components/input/input';
import Button from '../../../components/button/button';
import { go, goSync, isUserRejection, parseApi3 } from '../../../utils';
import './modals.scss';

interface Props {
  title: string;
  action: 'Withdraw' | 'Stake' | 'Initiate Unstaking';
  onConfirm: (parsedInput: BigNumber) => Promise<any>;
  onClose: () => void;
  open: boolean;
  onChange: (input: string) => void;
  inputValue: string;
  helperText?: ReactNode;
  showTokenInput?: boolean;
  maxValue?: BigNumber;
  closeOnConfirm?: boolean;
}

const TokenAmountModal = (props: Props) => {
  const [error, setError] = useState('');
  const {
    action,
    onConfirm,
    onClose,
    maxValue,
    onChange,
    inputValue,
    helperText,
    showTokenInput = true,
    closeOnConfirm = true,
  } = props;

  // The input field should catch any bad inputs, but just in case, try parse and display any errors
  const [parseErr, inputBigNum] = goSync(() => parseApi3(inputValue));

  const handleAction = async () => {
    if (!inputValue || inputValue === '0') {
      setError('Please ensure you have entered a non-zero amount');
      return;
    }
    if (parseErr || !inputBigNum) {
      setError('Unable to parse input amount');
      return;
    }
    if (maxValue) {
      if (inputBigNum.gt(maxValue)) {
        setError('Input amount cannot be higher than the available balance');
        return;
      }
    }
    setError('');

    const [err] = await go(onConfirm(inputBigNum));
    if (err) {
      if (isUserRejection(err)) {
        setError('Transaction rejected');
        return;
      }
      setError('Please try again and ensure you confirm the transaction');
      return;
    }

    if (closeOnConfirm) {
      props.onClose();
    }
  };

  const handleClose = () => {
    onChange('');
    setError('');
    onClose();
  };

  return (
    <Modal
      open={props.open}
      header={props.title}
      footer={
        <div className={classNames({ [`tokenAmountModal-actions`]: !showTokenInput })}>
          {!showTokenInput && (
            <Button type="text" onClick={onClose}>
              Cancel
            </Button>
          )}
          <Button type="secondary" onClick={handleAction}>
            {action}
          </Button>
        </div>
      }
      onClose={handleClose}
    >
      {showTokenInput && (
        <>
          <p className="tokenAmountModal-token medium">TOKEN</p>
          <Input value={inputValue} onChange={(e) => onChange(e.target.value)} size="large" />
          {error && <p className="tokenAmountModal-error">{error}</p>}
          {helperText}
        </>
      )}
    </Modal>
  );
};

export default TokenAmountModal;
