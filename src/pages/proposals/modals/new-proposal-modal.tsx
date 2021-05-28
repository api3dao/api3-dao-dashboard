import { useState, ReactNode } from 'react';
import classNames from 'classnames';
import { ProposalType } from '../../../chain-data';
import Button from '../../../components/button/button';
import Input from '../../../components/input/input';
import Textarea from '../../../components/textarea/textarea';
import GenericModal from '../../../components/modal/modal';
import { NewProposalFormData } from '../../../logic/proposals/encoding';

interface Props {
  open: boolean;
  onClose: () => void;
  onConfirm: (formData: NewProposalFormData) => void;
}

interface ProposalModalItemProps {
  children: ReactNode;
  name: ReactNode | string;
}

const ProposalModalItem = ({ children, name }: ProposalModalItemProps) => (
  <div className="new-proposal-modal-item">
    <div className="new-proposal-modal-name text-small">{name}</div>
    <div className="new-proposal-modal-input">{children}</div>
  </div>
);

const NewProposalModal = (props: Props) => {
  const { onClose, open, onConfirm } = props;

  const [type, setType] = useState<ProposalType>('primary');
  const [description, setDescription] = useState('');
  const [targetAddress, setTargetAddress] = useState('');
  const [targetSignature, setTargetSignature] = useState('');
  const [targetValue, setTargetValue] = useState('');
  const [parameters, setParameters] = useState('');

  return (
    <GenericModal
      onClose={onClose}
      open={open}
      header="New proposal"
      footer={
        <Button
          type="secondary"
          size="large"
          onClick={() =>
            // TODO: validate form data before confirm (e.g. parameters must be JSON.parse-ble)
            onConfirm({
              type,
              description,
              targetAddress,
              targetSignature,
              targetValue,
              parameters,
            })
          }
        >
          Create
        </Button>
      }
      size="large"
    >
      <ProposalModalItem name="proposal type">
        <div className="new-proposal-modal-radio-buttons">
          <div className={classNames('new-proposal-modal-radio', { [`_checked`]: type === 'primary' })}>
            <input
              type="radio"
              id="primary"
              name="type"
              onChange={() => setType('primary')}
              checked={type === 'primary'}
            />
            <label htmlFor="primary">Primary</label>
          </div>

          <div className={classNames('new-proposal-modal-radio', { [`_checked`]: type === 'secondary' })}>
            <input
              type="radio"
              id="secondary"
              name="type"
              onChange={() => setType('secondary')}
              checked={type === 'secondary'}
            />
            <label htmlFor="secondary">Secondary</label>
          </div>
        </div>
      </ProposalModalItem>

      <ProposalModalItem name={<label htmlFor="description">description</label>}>
        <Textarea
          id="description"
          placeholder="Describe the proposal"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
        />
      </ProposalModalItem>

      <ProposalModalItem name={<label htmlFor="target-address">Target contract address</label>}>
        <Input id="target-address" value={targetAddress} onChange={(e) => setTargetAddress(e.target.value)} block />
      </ProposalModalItem>

      <ProposalModalItem name={<label htmlFor="target-signature">Target contract signature</label>}>
        <Input
          id="target-signature"
          value={targetSignature}
          onChange={(e) => setTargetSignature(e.target.value)}
          block
        />
      </ProposalModalItem>

      <ProposalModalItem name={<label htmlFor="target-value">Value</label>}>
        <Input id="target-value" value={targetValue} onChange={(e) => setTargetValue(e.target.value)} block />
      </ProposalModalItem>

      <ProposalModalItem name={<label htmlFor="parameters">Parameters</label>}>
        <Textarea
          id="parameters"
          placeholder="Contract call parameters"
          value={parameters}
          onChange={(e) => setParameters(e.target.value)}
        />
      </ProposalModalItem>
    </GenericModal>
  );
};

export default NewProposalModal;
