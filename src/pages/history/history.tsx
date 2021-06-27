import { useState } from 'react';
import { BaseLayout } from '../../components/layout/layout';
import Header from '../../components/header/header';
import { useQueryParams } from '../../utils';
import { ProposalType } from '../../chain-data/state';
import { historyProposalsSelector, OptionalProposalType } from '../../logic/proposals/selectors';
import { useChainData } from '../../chain-data';
import BorderedBox from '../../components/bordered-box/bordered-box';
import RadioButton from '../../components/radio-button/radio-button';
import ProposalList from '../proposal-commons/proposal-list';
import styles from './history.module.scss';
import { useHistory } from 'react-router';
import { useTreasuryAndDelegation } from '../../logic/treasury-and-delegation/use-treasury-and-delegation';
import { useHistoryProposals } from '../../logic/proposals/hooks/history-proposals';

type FilterChoice = 'primary' | 'secondary' | 'both';

const getValidatedProposalType = (typeFromUrl: string | null): OptionalProposalType => {
  if (typeFromUrl && ['primary', 'secondary'].includes(typeFromUrl)) return typeFromUrl as ProposalType;
  else return null;
};

const History = () => {
  const { proposals: allProposals } = useChainData();
  const params = useQueryParams();
  const history = useHistory();
  const proposalType = getValidatedProposalType(params.get('type'));
  const proposalsToShow = historyProposalsSelector(allProposals, proposalType);
  const [checked, setChecked] = useState<FilterChoice>('both');

  // TODO: Implement pagination for history proposals
  useHistoryProposals();
  useTreasuryAndDelegation();

  const applyHistoryFilter = (type: ProposalType) => {
    // TODO: I find these tab logic confusing, maybe reiterate? See https://api3workspace.slack.com/archives/C020RCCC3EJ/p1622624192006000
    if (!proposalType || proposalType === type) {
      setChecked(type);
      history.replace(`/history?type=${type}`);
    } else {
      setChecked('both');
      history.replace(`/history`);
    }
  };

  return (
    <BaseLayout subtitle="History">
      <div className={styles.header}>
        <Header title="History"></Header>
      </div>

      <BorderedBox
        header={
          <div className={styles.borderBoxHeader}>
            <h5>Past proposals</h5>
            <div className={styles.radioButtons}>
              <RadioButton
                onClick={() => applyHistoryFilter('primary')}
                label="primary"
                checked={checked === 'primary' || checked === 'both'}
                color="white"
                checkIcon
                name="primary"
              />
              <RadioButton
                onClick={() => applyHistoryFilter('secondary')}
                label="secondary"
                checked={checked === 'secondary' || checked === 'both'}
                color="white"
                checkIcon
                name="secondary"
              />
            </div>
          </div>
        }
        content={<ProposalList proposals={proposalsToShow} type="past" />}
        noMobileBorders
      />
    </BaseLayout>
  );
};

export default History;
