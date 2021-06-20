import { useState, ReactNode } from 'react';
import { ProposalType } from '../../../chain-data';
import Button from '../../../components/button/button';
import RadioButton from '../../../components/radio-button/radio-button';
import Input from '../../../components/input/input';
import Textarea from '../../../components/textarea/textarea';
import { ModalFooter, ModalHeader } from '../../../components/modal/modal';
import { encodeEvmScript, NewProposalFormData } from '../../../logic/proposals/encoding';
import styles from './new-proposal-form.module.scss';
import { utils } from 'ethers';
import { Api3Agent } from '../../../contracts';
import { filterAlphanumerical, goSync } from '../../../utils';

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

interface Props {
  onClose: () => void;
  onConfirm: (formData: NewProposalFormData) => void;
  api3Agent: Api3Agent;
}

const NewProposalForm = (props: Props) => {
  const { onConfirm, api3Agent } = props;

  const [type, setType] = useState<ProposalType>('primary');
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [targetAddress, setTargetAddress] = useState('');
  const [targetSignature, setTargetSignature] = useState('');
  const [targetValue, setTargetValue] = useState('');
  const [parameters, setParameters] = useState('');

  const initialErrorsState = {
    title: '',
    description: '',
    targetAddress: '',
    parameters: '',
  };
  const [errors, setErrors] = useState(initialErrorsState);

  const validateForm = (formData: NewProposalFormData) => {
    const newErrors = { ...initialErrorsState };
    let foundErrors = false;

    if (filterAlphanumerical(title) === '') {
      newErrors.title = 'Title must have at least one alphanumeric character';
      foundErrors = true;
    }

    if (filterAlphanumerical(description) === '') {
      newErrors.description = 'Description must have at least one alphanumeric character';
      foundErrors = true;
    }

    if (!utils.isAddress(targetAddress)) {
      newErrors.targetAddress = 'Please specify a valid account address';
      foundErrors = true;
    }

    const [jsonParseError] = goSync(() => JSON.parse(formData.parameters));
    if (jsonParseError) {
      newErrors.parameters = 'Make sure parameters are in valid JSON format';
      foundErrors = true;
    }

    const [encodeError] = goSync(() => encodeEvmScript(formData, api3Agent));
    if (encodeError) {
      newErrors.parameters = 'Ensure parameters match target contract signature';
      foundErrors = true;
    }

    setErrors(newErrors);
    return foundErrors;
  };

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

      <ProposalFormItem name={<label htmlFor="title">Title</label>}>
        <Input id="title" value={title} onChange={(e) => setTitle(e.target.value)} block />
        {errors.title && <p className={styles.error}>{errors.title}</p>}
      </ProposalFormItem>

      <ProposalFormItem name={<label htmlFor="description">description</label>}>
        <Textarea
          id="description"
          placeholder="Describe the proposal"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
        />
        {errors.description && <p className={styles.error}>{errors.description}</p>}
      </ProposalFormItem>

      <ProposalFormItem name={<label htmlFor="target-address">Target contract address</label>}>
        <Input id="target-address" value={targetAddress} onChange={(e) => setTargetAddress(e.target.value)} block />
        {errors.targetAddress && <p className={styles.error}>{errors.targetAddress}</p>}
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
        <Input
          id="target-value"
          type="number"
          value={targetValue}
          onChange={(e) => setTargetValue(e.target.value)}
          block
        />
      </ProposalFormItem>

      <ProposalFormItem name={<label htmlFor="parameters">Parameters</label>}>
        <Textarea
          id="parameters"
          placeholder="Contract call parameters"
          value={parameters}
          onChange={(e) => setParameters(e.target.value)}
        />
        {errors.parameters && <p className={styles.error}>{errors.parameters}</p>}
      </ProposalFormItem>

      <ModalFooter>
        <Button
          type="secondary"
          size="large"
          onClick={() => {
            const formData = {
              type,
              description,
              targetAddress,
              targetSignature,
              targetValue,
              parameters,
              title,
            };

            if (!validateForm(formData)) {
              onConfirm(formData);
            }
          }}
        >
          Create
        </Button>
      </ModalFooter>
    </>
  );
};

export default NewProposalForm;
