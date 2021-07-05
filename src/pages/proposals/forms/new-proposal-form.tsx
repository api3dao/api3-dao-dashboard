import { useState, ReactNode } from 'react';
import { ProposalType } from '../../../chain-data';
import Button from '../../../components/button/button';
import RadioButton from '../../../components/radio-button/radio-button';
import Input from '../../../components/input/input';
import Textarea from '../../../components/textarea/textarea';
import Tooltip from '../../../components/tooltip/tooltip';
import { ModalFooter, ModalHeader } from '../../../components/modal/modal';
import { encodeEvmScript, NewProposalFormData } from '../../../logic/proposals/encoding';
import { Api3Agent } from '../../../contracts';
import { filterAlphanumerical, GO_ERROR_INDEX, images, isGoSuccess } from '../../../utils';
import styles from './new-proposal-form.module.scss';
import globalStyles from '../../../styles/global-styles.module.scss';
import classNames from 'classnames';

interface ProposalFormItemProps {
  children: ReactNode;
  name: ReactNode | string;
  tooltip: string;
}

const ProposalFormItem = ({ children, name, tooltip }: ProposalFormItemProps) => (
  <div className={styles.newProposalFormItem}>
    <div className={styles.newProposalFormName}>
      {name}
      <Tooltip overlay={tooltip}>
        <img src={images.help} alt="help" className={globalStyles.helpIcon} />
      </Tooltip>
    </div>
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
  const [targetValue, setTargetValue] = useState('0');
  const [parameters, setParameters] = useState('');

  const initialErrorsState = {
    title: '',
    description: '',
    targetAddress: '',
    targetSignature: '',
    parameters: '',
    generic: '',
    targetValue: '',
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

    const goEncodeEvmScript = encodeEvmScript(formData, api3Agent);
    if (!isGoSuccess(goEncodeEvmScript)) {
      const { field, value } = goEncodeEvmScript[GO_ERROR_INDEX];
      newErrors[field] = value;
      foundErrors = true;
    }

    setErrors(newErrors);
    return foundErrors;
  };

  return (
    <>
      <ModalHeader>New Proposal</ModalHeader>

      <ProposalFormItem
        name="proposal type"
        tooltip="A primary-type proposal will be enacted by the primary agent of the DAO, and vice versa."
      >
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

      <ProposalFormItem
        name={<label htmlFor="title">Title</label>}
        tooltip="Title of the proposal that will be displayed on the governance page."
      >
        <Input id="title" value={title} onChange={(e) => setTitle(e.target.value)} block autoFocus />
        {errors.title && <p className={styles.error}>{errors.title}</p>}
      </ProposalFormItem>

      <ProposalFormItem
        name={<label htmlFor="description">Description</label>}
        tooltip="Description of the proposal that will be displayed with its details."
      >
        <Textarea
          id="description"
          placeholder="Describe the proposal"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
        />
        {errors.description && <p className={styles.error}>{errors.description}</p>}
      </ProposalFormItem>

      <ProposalFormItem
        name={<label htmlFor="target-address">Target Contract Address</label>}
        tooltip="The address of the contract you want to be called when the proposal is executed."
      >
        <Input id="target-address" value={targetAddress} onChange={(e) => setTargetAddress(e.target.value)} block />
        {errors.targetAddress && <p className={styles.error}>{errors.targetAddress}</p>}
      </ProposalFormItem>

      <ProposalFormItem
        name={<label htmlFor="target-signature">Target Contract Signature</label>}
        tooltip={`The signature of the function at the target contract you want to have called (e.g. "transfer(address,uint256)").`}
      >
        <Input
          id="target-signature"
          value={targetSignature}
          onChange={(e) => setTargetSignature(e.target.value)}
          block
        />
        {errors.targetSignature && <p className={styles.error}>{errors.targetSignature}</p>}
      </ProposalFormItem>

      <ProposalFormItem
        name={<label htmlFor="target-value">ETH Value</label>}
        tooltip={`The amount of ETH you want to send along with the function call in Wei (use 0 unless the target function is "payable").`}
      >
        <Input
          id="target-value"
          type="number"
          value={targetValue}
          onChange={(e) => setTargetValue(e.target.value)}
          block
        />
        {errors.targetValue && <p className={styles.error}>{errors.targetValue}</p>}
      </ProposalFormItem>

      <ProposalFormItem
        name={<label htmlFor="parameters">Parameters</label>}
        tooltip="The arguments that will be used to call the target function. Enter as a JSON array where the values are stringified."
      >
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
        {errors.generic && <p className={classNames(styles.error, styles.marginTopMd)}>{errors.generic}</p>}
      </ModalFooter>
    </>
  );
};

export default NewProposalForm;
