import { BigNumber, FixedNumber } from 'ethers';
import { ChangeEventHandler, ReactNode, useState } from 'react';
import classNames from 'classnames';
import Modal from '../../../components/modal/modal';
import Input from '../../../components/input/input';
import Button from '../../../components/button/button';
import { go, fixedToBigNumber } from '../../../utils';
import './token-amount-modal.scss';

interface Props {
  title: string;
  action: 'Withdraw' | 'Stake' | 'Initiate Unstaking';
  onConfirm: () => void | Promise<any>;
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

  const inputBigNum = fixedToBigNumber(FixedNumber.from(inputValue || '0'));

  const handleAction = async () => {
    if (!inputValue || inputValue === '0') {
      setError('Please ensure you have entered a non-zero value');
      return;
    }
    if (props.maxValue) {
      if (inputBigNum.gt(props.maxValue)) {
        setError('Input value cannot be higher than the available balance');
        return;
      }
    }

    setError('');

    // const [err] = await go(onConfirm());
    // if (err) {
    //   setError('Please try again and ensure you confirm the transaction');
    //   return;
    // }

    if (props.closeOnConfirm) {
      props.onClose();
    }
  };

  const handleClose = () => {
    setError('');
    onClose();
  };

  const isDeposit = action === 'Deposit';
  const amountWithinAllowance = isDeposit && maxValue && !!inputValue && inputBigNum.lte(maxValue);

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
          {isDeposit && (
            <Button
              type={amountWithinAllowance ? 'secondary' : 'primary'}
              onClick={handleAction}
              disabled={amountWithinAllowance}
              className="tokenAmountModal-approve"
            >
              Approve
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
          {error && <p className="error">{error}</p>}
          {helperText}
        </>
      )}
    </Modal>
  );
};

export default TokenAmountModal;
