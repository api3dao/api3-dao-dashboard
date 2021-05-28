import { useState, ReactNode } from 'react';
import classNames from 'classnames';
import { ProposalType } from '../../../chain-data';
import Button from '../../../components/button/button';
import Input from '../../../components/input/input';
import Textarea from '../../../components/textarea/textarea';
import { ModalFooter, ModalHeader } from '../../../components/modal/modal';
import { NewProposalFormData } from '../../../logic/proposals/encoding';
import './forms.scss';

interface Props {
  onClose: () => void;
  onConfirm: (formData: NewProposalFormData) => void;
}

interface ProposalFormItemProps {
  children: ReactNode;
  name: ReactNode | string;
}

const ProposalFormItem = ({ children, name }: ProposalFormItemProps) => (
  <div className="new-proposal-form-item">
    <div className="new-proposal-form-name text-small">{name}</div>
    <div className="new-proposal-form-input">{children}</div>
  </div>
);

const NewProposalForm = (props: Props) => {
  const { onConfirm } = props;

  const [type, setType] = useState<ProposalType>('primary');
  const [description, setDescription] = useState('');
  const [targetAddress, setTargetAddress] = useState('');
  const [targetSignature, setTargetSignature] = useState('');
  const [targetValue, setTargetValue] = useState('');
  const [parameters, setParameters] = useState('');

  return (
    <>
      <ModalHeader>New proposal</ModalHeader>

      <ProposalFormItem name="proposal type">
        <div className="new-proposal-form-radio-buttons">
          <div className={classNames('new-proposal-form-radio', { [`_checked`]: type === 'primary' })}>
            <input
              type="radio"
              id="primary"
              name="type"
              onChange={() => setType('primary')}
              checked={type === 'primary'}
            />
            <label htmlFor="primary">Primary</label>
          </div>

          <div className={classNames('new-proposal-form-radio', { [`_checked`]: type === 'secondary' })}>
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
      </ProposalFormItem>

      <ProposalFormItem name={<label htmlFor="description">description</label>}>
        <Textarea
          id="description"
          placeholder="Describe the proposal"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
        />
      </ProposalFormItem>

      <ProposalFormItem name={<label htmlFor="target-address">Target contract address</label>}>
        <Input id="target-address" value={targetAddress} onChange={(e) => setTargetAddress(e.target.value)} block />
      </ProposalFormItem>

      <ProposalFormItem name={<label htmlFor="target-signature">Target contract signature</label>}>
        <Input
          id="target-signature"
          value={targetSignature}
          onChange={(e) => setTargetSignature(e.target.value)}
          block
        />
      </ProposalFormItem>

      <ProposalFormItem name={<label htmlFor="target-value">Value</label>}>
        <Input id="target-value" value={targetValue} onChange={(e) => setTargetValue(e.target.value)} block />
      </ProposalFormItem>

      <ProposalFormItem name={<label htmlFor="parameters">Parameters</label>}>
        <Textarea
          id="parameters"
          placeholder="Contract call parameters"
          value={parameters}
          onChange={(e) => setParameters(e.target.value)}
        />
      </ProposalFormItem>

      <ModalFooter>
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
      </ModalFooter>
    </>
  );
};

export default NewProposalForm;
