import { useState, ReactNode } from 'react';
import { ProposalType } from '../../../chain-data';
import Button from '../../../components/button';
import RadioButton from '../../../components/radio-button/radio-button';
import { Input, Textarea } from '../../../components/form';
import { Tooltip } from '../../../components/tooltip';
import { ModalFooter, ModalHeader } from '../../../components/modal';
import {
  goEncodeEvmScript,
  EncodedEvmScriptError,
  NewProposalFormData,
  METADATA_SCHEME_VERSION,
} from '../../../logic/proposals/encoding';
import { Api3Agent } from '../../../contracts';
import { filterAlphanumerical, images } from '../../../utils';
import styles from './new-proposal-form.module.scss';
import classNames from 'classnames';
import { providers } from 'ethers';
import { InfoCircleIcon } from '../../../components/icons';
import ExternalLink from '../../../components/external-link';

interface ProposalFormItemProps {
  children: ReactNode;
  name: ReactNode | string;
  tooltip: string;
  noMargin?: boolean;
}

const ProposalFormItem = ({ children, name, tooltip, noMargin = false }: ProposalFormItemProps) => (
  <div className={styles.proposalFormItem}>
    <div className={classNames(styles.proposalFormItemName, { [styles.noMargin]: noMargin })}>
      {name}
      <Tooltip overlay={tooltip}>
        <InfoCircleIcon className={styles.infoIcon} />
      </Tooltip>
    </div>

    <div className={styles.proposalFormItemContent}>{children}</div>
  </div>
);

interface Props {
  onClose: () => void;
  onConfirm: (formData: NewProposalFormData) => void;
  api3Agent: Api3Agent;
  provider: providers.Provider;
}

const NewProposalForm = (props: Props) => {
  const { onConfirm, api3Agent, provider } = props;

  const [type, setType] = useState<ProposalType>('secondary');
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

  const validateForm = async (formData: NewProposalFormData) => {
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

    const goRes = await goEncodeEvmScript(provider, { ...formData, version: METADATA_SCHEME_VERSION }, api3Agent);
    if (!goRes.success) {
      if (goRes.error instanceof EncodedEvmScriptError) {
        const { field, value } = goRes.error;
        newErrors[field] = value;
      } else {
        // We should always get an EncodedEvmScriptError, but we give the user a message just in case it is not
        newErrors.generic = 'Failed to encode';
      }
      foundErrors = true;
    }

    setErrors(newErrors);
    return foundErrors;
  };

  return (
    <>
      <ModalHeader size="large">New Proposal</ModalHeader>
      <div className={styles.helpLinkWrapper}>
        <ExternalLink
          type="link-blue"
          href="https://dao-docs.api3.org/members/proposals.html"
          className={styles.helpLink}
        >
          Help
        </ExternalLink>
        <img src={images.externalLink} alt="" />
      </div>
      <div className={styles.newProposalModalContent}>
        <ProposalFormItem
          name="Proposal type"
          tooltip="A primary-type proposal will be enacted by the primary agent of the DAO, and vice versa."
          noMargin
        >
          <div className={styles.proposalTypeRadioButtons} role="radiogroup" aria-label="Proposal type">
            <RadioButton name="proposal-type" checked={type === 'primary'} onChange={() => setType('primary')}>
              Primary
            </RadioButton>
            <RadioButton name="proposal-type" checked={type === 'secondary'} onChange={() => setType('secondary')}>
              Secondary
            </RadioButton>
          </div>
        </ProposalFormItem>

        <ProposalFormItem
          name={<label htmlFor="title">Title</label>}
          tooltip="Title of the proposal that will be displayed on the governance page."
        >
          <Input
            id="title"
            placeholder="This will be used to identify the proposal."
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            error={!!errors.title}
            helperText={errors.title}
            autoFocus
          />
        </ProposalFormItem>

        <ProposalFormItem
          name={<label htmlFor="description">Description</label>}
          tooltip="Description of the proposal that will be displayed with its details."
        >
          <Textarea
            id="description"
            placeholder="While a description of your proposal can be typed text, it’s highly recommended to instead use a PDF hosted on IPFS and adding a link back to the forum where you posted your proposal for discussion."
            value={description}
            error={!!errors.description}
            helperText={errors.description}
            onChange={(e) => setDescription(e.target.value)}
          />
        </ProposalFormItem>

        <ProposalFormItem
          name={<label htmlFor="target-address">Target Address</label>}
          tooltip="The address of the contract you want to be called when the proposal is executed."
        >
          <Input
            id="target-address"
            placeholder="This is the address of the contract to call."
            value={targetAddress}
            error={!!errors.targetAddress}
            helperText={errors.targetAddress}
            onChange={(e) => setTargetAddress(e.target.value)}
          />
        </ProposalFormItem>

        <ProposalFormItem
          name={<label htmlFor="target-signature">Target Contract Signature</label>}
          tooltip={`The signature of the function at the target contract you want to have called (e.g. "transfer(address,uint256)").`}
        >
          <Input
            id="target-signature"
            placeholder="The signature of the function to call."
            value={targetSignature}
            error={!!errors.targetSignature}
            helperText={errors.targetSignature}
            onChange={(e) => setTargetSignature(e.target.value)}
          />
        </ProposalFormItem>

        <ProposalFormItem
          name={<label htmlFor="target-value">Value (Wei)</label>}
          tooltip={`The amount of ETH you want to send along with the function call in Wei (use 0 unless the target function is "payable").`}
        >
          <Input
            id="target-value"
            placeholder="0"
            type="number"
            value={targetValue}
            error={!!errors.targetValue}
            helperText={errors.targetValue}
            onChange={(e) => setTargetValue(e.target.value)}
          />
        </ProposalFormItem>

        <ProposalFormItem
          name={<label htmlFor="parameters">Parameters</label>}
          tooltip="The arguments that will be used to call the target function. Enter as a JSON array where the values are stringified."
        >
          <Textarea
            id="parameters"
            placeholder="These are the arguments that will be used to satisfy the Target contract signature function."
            value={parameters}
            error={!!errors.parameters}
            helperText={errors.parameters}
            onChange={(e) => setParameters(e.target.value)}
          />
        </ProposalFormItem>
      </div>

      <ModalFooter>
        <div className={styles.newProposalModalFooter}>
          <Button
            type="primary"
            size="sm"
            sm={{ size: 'large' }}
            onClick={async () => {
              const formData = {
                type,
                description,
                targetAddress,
                targetSignature,
                targetValue,
                parameters,
                title,
              };

              const containsError = await validateForm(formData);
              if (!containsError) {
                onConfirm(formData);
              }
            }}
          >
            Create
          </Button>

          {errors.generic && <p className={classNames(styles.error, styles.marginTopMd)}>{errors.generic}</p>}
        </div>
      </ModalFooter>
    </>
  );
};

export default NewProposalForm;
