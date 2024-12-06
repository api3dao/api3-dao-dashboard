import { useState } from 'react';
import Button from '../../../../components/button';
import RadioButton from '../../../../components/radio-button/radio-button';
import styles from './vote-form.module.scss';
import { ModalFooter, ModalHeader } from '../../../../components/modal';

export type VotingChoice = 'for' | 'against';

interface Props {
  onConfirm: (choice: VotingChoice) => void;
  voteId: string;
}

const VoteForm = (props: Props) => {
  const { onConfirm, voteId } = props;
  const [checked, setChecked] = useState<VotingChoice>('for');

  const isVotingFor = checked === 'for';

  return (
    <>
      <ModalHeader>{`Vote on Proposal #${voteId}`}</ModalHeader>

      <div className={styles.voteFormContent} role="radiogroup" aria-label="Vote form">
        <RadioButton
          size="large"
          name="vote-form"
          color="warning"
          onChange={() => setChecked('against')}
          checked={!isVotingFor}
        >
          Against
        </RadioButton>
        <RadioButton size="large" name="vote-form" onChange={() => setChecked('for')} checked={isVotingFor}>
          For
        </RadioButton>
      </div>

      <ModalFooter>
        <div className={styles.voteFormFooter}>
          <Button type="primary" size="sm" sm={{ size: 'lg' }} onClick={() => onConfirm(checked)}>
            Create Transaction
          </Button>
        </div>
      </ModalFooter>
    </>
  );
};

export default VoteForm;
