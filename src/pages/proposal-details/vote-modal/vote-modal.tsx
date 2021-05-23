import classNames from 'classnames';
import { useState } from 'react';
import Button from '../../../components/button/button';
import Modal from '../../../components/modal/modal';
import './vote-modal.scss';

export type VotingChoice = 'for' | 'against';

interface Props {
  onClose: () => void;
  open: boolean;
  onConfirm: (choice: VotingChoice) => void;
  voteId: string;
}

const VoteModal = (props: Props) => {
  const { onConfirm, voteId, ...modalProps } = props;
  const [checked, setChecked] = useState<VotingChoice>('for');

  const isVotingFor = checked === 'for';

  return (
    <Modal {...modalProps}>
      <h5>Vote on Proposal {voteId}#</h5>
      <div className="content text-xlarge">
        <div className={classNames('for', { checked: isVotingFor })}>
          <input type="radio" name="vote" id="for" checked={isVotingFor} onChange={() => setChecked('for')} />
          <label htmlFor="for">For</label>
        </div>
        <div className={classNames('against', { checked: !isVotingFor })}>
          <input type="radio" name="vote" id="against" checked={!isVotingFor} onChange={() => setChecked('against')} />
          <label htmlFor="against">Against</label>
        </div>
      </div>
      <Button type="secondary" onClick={() => onConfirm(checked)}>
        Create transaction
      </Button>
    </Modal>
  );
};

export default VoteModal;
