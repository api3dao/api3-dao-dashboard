import { BigNumber } from 'ethers';
import { useState } from 'react';
import { MAX_ALLOWANCE, useApi3Pool, useApi3Token } from '../../../contracts';
import { useChainData } from '../../../chain-data';
import Modal from '../../../components/modal/modal';
import Input from '../../../components/input/input';
import Button from '../../../components/button/button';
import { go, goSync, formatApi3, parseApi3 } from '../../../utils';
import './token-amount-modal.scss';

interface Props {
  allowance: BigNumber;
  balance: BigNumber;
  onClose: () => void;
  open: boolean;
}

const TokenDepositModal = (props: Props) => {
  const { allowance, balance, onClose } = props;

  const { setChainData, transactions, userAccount } = useChainData();
  const api3Token = useApi3Token();
  const api3Pool = useApi3Pool();

  const [inputValue, setInputValue] = useState('');
  const [error, setError] = useState('');

  let [parseErr, inputBigNum] = goSync(() => parseApi3(inputValue));
  if (parseErr || !inputBigNum) {
    inputBigNum = BigNumber.from(0);
  }

  const handleApprove = async () => {
    setError('');
    const [err, tx] = await go(api3Token!.approve(api3Pool ? api3Pool.address : '', MAX_ALLOWANCE));
    // TODO: check error code
    if (err) {
      setError('Failed to approve API3 token allowance. Please try again');
      return;
    }
    if (tx) {
      setChainData({ transactions: [...transactions, tx] });
    }
  };

  const handleDeposit = async () => {
    if (!inputValue || inputValue === '0') {
      setError('Please ensure you have entered a non-zero value');
      return;
    }
    if ((inputBigNum as BigNumber).gt(balance)) {
      setError('Input value cannot be higher than the available balance');
      return;
    }
    setError('');
    const [err, tx]  = await go(api3Pool!.deposit(userAccount, parseApi3(inputValue), userAccount));
    // TODO: check error code
    if (err) {
      setError('Please try again and ensure you confirm the transaction');
      return;
    }
    if (tx) {
      setChainData({ transactions: [...transactions, tx] });
    }
    props.onClose();
  };

  const handleClose = () => {
    setError('');
    onClose();
  };

  if (!api3Pool || !api3Token) {
    return null;
  }

  const approvalRequired = !!inputBigNum && inputBigNum.gt(allowance);
  const canDeposit = !approvalRequired && inputBigNum.gt(0);

  console.log('============================');
  console.log(inputValue);
  console.log(allowance.toString());
  console.log('============================');

  return (
    <Modal
      open={props.open}
      header="How many tokens would you like to deposit?"
      footer={
        <div className="tokenAmountModal-actions">
          <Button
            type={approvalRequired ? 'primary' : 'secondary'}
            onClick={handleApprove}
            disabled={!approvalRequired}
            className="tokenAmountModal-approve"
          >
            Approve
          </Button>

          <Button
            type={canDeposit  ? 'primary' : 'secondary'}
            onClick={handleDeposit}
            disabled={!canDeposit}
          >
            Deposit
          </Button>
        </div>
      }
      onClose={handleClose}
    >
      <p className="tokenAmountModal-token medium">TOKEN</p>

      <Input value={inputValue} onChange={(e) => setInputValue(e.target.value)} size="large" />

      {error && <p className="error">{error}</p>}

      <div className="depositModal-balance">
        Your balance: {balance ? formatApi3(balance) : '0.0'}
      </div>
    </Modal>
  );
};

export default TokenDepositModal;
