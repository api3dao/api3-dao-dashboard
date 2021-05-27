import { BigNumber } from 'ethers';
import { ChangeEventHandler, ReactNode, useState } from 'react';
import classNames from 'classnames';
import Modal from '../../../components/modal/modal';
import Input from '../../../components/input/input';
import Button from '../../../components/button/button';
import { go, goSync, isUserRejection, parseApi3, messages } from '../../../utils';
import './modals.scss';

interface Props {
  title: string;
  action: 'Withdraw' | 'Stake' | 'Initiate Unstaking';
  onConfirm: (parsedInput: BigNumber) => Promise<any>;
  onClose: () => void;
  open: boolean;
  onChange: ChangeEventHandler<HTMLInputElement>;
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
        // TODO: rather create a toast/notification
        setError(messages.TX_GENERIC_REJECTED);
        return;
      }
      setError(messages.TX_GENERIC_ERROR);
      return;
    }

    if (closeOnConfirm) {
      props.onClose();
    }
  };

  const handleClose = () => {
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
          <Input value={inputValue} onChange={onChange} size="large" />
          {error && <p className="tokenAmountModal-error">{error}</p>}
          {helperText}
        </>
      )}
    </Modal>
  );
};

export default TokenAmountModal;
