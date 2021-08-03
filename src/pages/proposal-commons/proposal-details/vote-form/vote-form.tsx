import { useState } from 'react';
import Button from '../../../../components/button';
import RadioButton from '../../../../components/radio-button/radio-button';
import styles from './vote-form.module.scss';

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
    <div className={styles.voteForm}>
      <h5>Vote on Proposal #{voteId}</h5>
      <div className={styles.voteFormContent}>
        <div>
          <RadioButton
            label={<h4>For</h4>}
            onChange={() => setChecked('for')}
            checked={isVotingFor}
            name="for"
            color="green"
          />
          <RadioButton
            label={<h4>Against</h4>}
            onChange={() => setChecked('against')}
            checked={!isVotingFor}
            name="against"
            color="pink"
          />
        </div>
      </div>
      <Button type="secondary" size="large" onClick={() => onConfirm(checked)}>
        Create Transaction
      </Button>
    </div>
  );
};

export default VoteForm;
