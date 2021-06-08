import { BaseLayout } from '../../components/layout/layout';
import Header from '../../components/header/header';
import { useQueryParams } from '../../utils';
import { ProposalType } from '../../chain-data/state';
import { historyProposalsSelector, OptionalProposalType } from '../../logic/proposals/selectors';
import { useChainData } from '../../chain-data';
import BorderedBox from '../../components/bordered-box/bordered-box';
import Button from '../../components/button/button';
import ProposalList from '../proposal-commons/proposal-list';
import styles from './history.module.scss';
import classNames from 'classnames';
import { useHistory } from 'react-router';
import Treasury from '../proposal-commons/treasury/treasury';
import { useLoadAllProposals, useReloadActiveProposalsOnMinedBlock } from '../../logic/proposals/hooks';
import { useTreasuryAndDelegation } from '../../logic/treasury-and-delegation/use-treasury-and-delegation';

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

  useLoadAllProposals();
  useReloadActiveProposalsOnMinedBlock();
  useTreasuryAndDelegation();

  const applyHistoryFilter = (type: ProposalType) => {
    // TODO: I find these tab logic confusing, maybe reiterate? See https://api3workspace.slack.com/archives/C020RCCC3EJ/p1622624192006000
    if (!proposalType || proposalType === type) history.replace(`/history?type=${type}`);
    else history.replace(`/history`);
  };

  return (
    <BaseLayout>
      <div className={styles.header}>
        <Header title="History" sectionTitle="History"></Header>
        <Treasury className={styles.treasury} />
      </div>

      <BorderedBox
        header={
          <div className={styles.borderBoxHeader}>
            <h5>Proposals</h5>
            <div>
              <Button
                onClick={() => applyHistoryFilter('primary')}
                type="text"
                className={classNames({ [styles.active]: !proposalType || proposalType === 'primary' })}
                buttonClassName={styles.button}
              >
                Primary
              </Button>
              <Button
                onClick={() => applyHistoryFilter('secondary')}
                type="text"
                className={classNames({
                  [styles.active]: !proposalType || proposalType === 'secondary',
                })}
                buttonClassName={styles.button}
              >
                Secondary
              </Button>
            </div>
          </div>
        }
        content={<ProposalList proposals={proposalsToShow} />}
      />
    </BaseLayout>
  );
};

export default History;
