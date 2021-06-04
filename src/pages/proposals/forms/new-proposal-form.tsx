import { useState, ReactNode } from 'react';
import { ProposalType } from '../../../chain-data';
import Button from '../../../components/button/button';
import RadioButton from '../../../components/radio-button/radio-button';
import Input from '../../../components/input/input';
import Textarea from '../../../components/textarea/textarea';
import { ModalFooter, ModalHeader } from '../../../components/modal/modal';
import { NewProposalFormData } from '../../../logic/proposals/encoding';
import styles from './forms.module.scss';

interface Props {
  onClose: () => void;
  onConfirm: (formData: NewProposalFormData) => void;
}

interface ProposalFormItemProps {
  children: ReactNode;
  name: ReactNode | string;
}

const ProposalFormItem = ({ children, name }: ProposalFormItemProps) => (
  <div className={styles.newProposalFormItem}>
    <div className={styles.newProposalFormName}>{name}</div>
    <div className={styles.newProposalFormInput}>{children}</div>
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
        <div className={styles.newProposalFormRadioButtons}>
          <RadioButton
            label="Primary"
            name="type"
            onChange={() => setType('primary')}
            checked={type === 'primary'}
            color="white"
          />
          <RadioButton
            label="Secondary"
            name="type"
            onChange={() => setType('secondary')}
            checked={type === 'secondary'}
            color="white"
          />
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
