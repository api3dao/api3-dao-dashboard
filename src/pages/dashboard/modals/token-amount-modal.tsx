import { BigNumber } from 'ethers';
import { ChangeEventHandler, ReactNode, useState } from 'react';
import classNames from 'classnames';
import Modal from '../../../components/modal/modal';
import Input from '../../../components/input/input';
import Button from '../../../components/button/button';
import { go, goSync, isUserRejection, parseApi3 } from '../../../utils';
import './modals.scss';

interface Props {
  title: string;
  action: 'Withdraw' | 'Stake' | 'Initiate Unstaking';
  onConfirm: () => Promise<any>;
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
  const { action, onConfirm, onClose, maxValue, onChange, inputValue, helperText, showTokenInput = true } = props;

  let [parseErr, inputBigNum] = goSync(() => parseApi3(inputValue));
  if (parseErr || !inputBigNum) {
    inputBigNum = BigNumber.from(0);
  }

  const handleAction = async () => {
    if (!inputValue || inputValue === '0') {
      setError('Please ensure you have entered a non-zero value');
      return;
    }
    if (maxValue) {
      if ((inputBigNum as BigNumber).gt(maxValue)) {
        setError('Input value cannot be higher than the available balance');
        return;
      }
    }
    setError('');

    const [err] = await go(onConfirm());
    if (err) {
      if (isUserRejection(err)) {
        setError('Transaction rejected. Please try again');
        return;
      }
      setError('Please try again and ensure you confirm the transaction');
      return;
    }

    if (props.closeOnConfirm) {
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
