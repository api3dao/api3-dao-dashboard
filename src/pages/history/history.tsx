import { useState, useEffect } from 'react';
import { BaseLayout } from '../../components/layout';
import Header from '../../components/header';
import { useQueryParams } from '../../utils';
import { ProposalType } from '../../chain-data/state';
import { historyProposalsSelector, OptionalProposalType } from '../../logic/proposals/selectors';
import { useChainData } from '../../chain-data';
import RadioButton from '../../components/radio-button/radio-button';
import ProposalList from '../proposal-commons/proposal-list';
import styles from './history.module.scss';
import { useHistory } from 'react-router';
import { useTreasuryAndDelegation } from '../../logic/treasury-and-delegation/use-treasury-and-delegation';
import { useHistoryProposals } from '../../logic/proposals/hooks/history-proposals';

const getValidatedProposalType = (typeFromUrl: string | null): OptionalProposalType => {
  if (typeFromUrl && ['primary', 'secondary', 'none'].includes(typeFromUrl)) return typeFromUrl as ProposalType;
  else return null;
};

const History = () => {
  const { proposals: allProposals } = useChainData();
  const params = useQueryParams();
  const history = useHistory();
  const proposalType = getValidatedProposalType(params.get('type'));
  const proposalsToShow = historyProposalsSelector(allProposals, proposalType);
  const [checkedPrimary, setCheckedPrimary] = useState(true);
  const [checkedSecondary, setCheckedSecondary] = useState(true);

  // TODO: Implement pagination for history proposals
  useHistoryProposals();
  useTreasuryAndDelegation();

  // useEffect is used because useState behaves asynchronously using onClick handler
  useEffect(() => {
    if (checkedPrimary && !checkedSecondary) {
      history.replace(`/history?type=primary`);
    } else if (checkedSecondary && !checkedPrimary) {
      history.replace(`/history?type=secondary`);
    } else if (!checkedPrimary && !checkedSecondary) {
      history.replace(`/history?type=none`);
    } else {
      history.replace(`/history`);
    }
  }, [history, checkedPrimary, checkedSecondary]);

  return (
    <BaseLayout title="History">
      <div className={styles.header}>
        <Header title="History"></Header>
      </div>

      <div className={styles.proposalsHeader}>
        <h5>Past Proposals</h5>
        <div className={styles.radioButtons}>
          <RadioButton type="checkbox" checked={checkedPrimary} onChange={() => setCheckedPrimary(!checkedPrimary)}>
            Primary
          </RadioButton>
          <RadioButton
            type="checkbox"
            checked={checkedSecondary}
            onChange={() => setCheckedSecondary(!checkedSecondary)}
          >
            Secondary
          </RadioButton>
        </div>
      </div>
      <ProposalList proposals={proposalsToShow} type="past" />
    </BaseLayout>
  );
};

export default History;
