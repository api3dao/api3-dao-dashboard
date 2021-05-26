import { useState } from 'react';
import { ProposalType } from '../../chain-data';
import Button from '../../components/button/button';
import { NewProposalFormData } from '../../logic/proposals/encoding';

interface Props {
  onConfirm: (formData: NewProposalFormData) => void;
}

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
      <h5>New proposal</h5>

      <p>Proposal type</p>
      <div>
        <input type="radio" id="primary" name="type" onChange={() => setType('primary')} checked={type === 'primary'} />
        <label htmlFor="primary">Primary</label>

        <input
          type="radio"
          id="secondary"
          name="type"
          onChange={() => setType('secondary')}
          checked={type === 'secondary'}
        />
        <label htmlFor="secondary">Secondary</label>
      </div>

      <label htmlFor="description"></label>
      <textarea
        id="description"
        cols={10}
        rows={50}
        placeholder="Describe the proposal"
        value={description}
        onChange={(e) => setDescription(e.target.value)}
      ></textarea>

      <label htmlFor="target-address">Target contract address</label>
      <input type="text" id="target-address" value={targetAddress} onChange={(e) => setTargetAddress(e.target.value)} />

      <label htmlFor="target-signature">Target contract signature</label>
      <input
        type="text"
        id="target-signature"
        value={targetSignature}
        onChange={(e) => setTargetSignature(e.target.value)}
      />

      <label htmlFor="target-value">Value</label>
      <input type="text" id="target-value" value={targetValue} onChange={(e) => setTargetValue(e.target.value)} />

      <label htmlFor="parameters">Parameters</label>
      <textarea
        id="parameters"
        cols={10}
        rows={50}
        placeholder="Contract call parameters"
        value={parameters}
        onChange={(e) => setParameters(e.target.value)}
      ></textarea>

      <Button
        type="secondary"
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
    </>
  );
};

export default NewProposalForm;
