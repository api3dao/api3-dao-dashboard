import { useState, useEffect } from 'react';
import { useHistory } from 'react-router';

import { useChainData } from '../../chain-data';
import type { ProposalType } from '../../chain-data/state';
import BorderedBox from '../../components/bordered-box/bordered-box';
import Header from '../../components/header';
import { BaseLayout } from '../../components/layout';
import RadioButton from '../../components/radio-button/radio-button';
import { useHistoryProposals } from '../../logic/proposals/hooks/history-proposals';
import { historyProposalsSelector, type OptionalProposalType } from '../../logic/proposals/selectors';
import { useTreasuryAndDelegation } from '../../logic/treasury-and-delegation/use-treasury-and-delegation';
import { useQueryParams } from '../../utils';
import ProposalList from '../proposal-commons/proposal-list';

import styles from './history.module.scss';

const getValidatedProposalType = (typeFromUrl: string | null): OptionalProposalType => {
  return typeFromUrl && ['primary', 'secondary', 'none'].includes(typeFromUrl) ? (typeFromUrl as ProposalType) : null;
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

  // UseEffect is used because useState behaves asynchronously using onClick handler
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
    <BaseLayout subtitle="History">
      <div className={styles.header}>
        <Header title="History" />
      </div>

      <BorderedBox
        header={
          <div className={styles.borderBoxHeader}>
            <h5>Past Proposals</h5>
            <div className={styles.radioButtons}>
              <RadioButton
                onChange={() => setCheckedPrimary(!checkedPrimary)}
                label="Primary"
                checked={checkedPrimary}
                color="white"
                type="checkbox"
              />
              <RadioButton
                onChange={() => setCheckedSecondary(!checkedSecondary)}
                label="Secondary"
                checked={checkedSecondary}
                color="white"
                type="checkbox"
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
