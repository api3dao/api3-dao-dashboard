import { BaseLayout } from '../../components/layout';
import Header from '../../components/header';
import { useQueryParams } from '../../utils';
import BorderedBox from '../../components/bordered-box/bordered-box';
import RadioButton from '../../components/radio-button/radio-button';
import ProposalList, { EmptyState } from '../components/proposal-list';
import Pagination from '../../components/pagination';
import ConnectButton from '../../components/connect-button';
import { useHistory } from 'react-router';
import { useChainData } from '../../chain-data';
import { useTreasuryAndDelegation } from '../../logic/treasury-and-delegation/use-treasury-and-delegation';
import { useProposals } from '../../logic/proposals/data';
import styles from './history.module.scss';

type TypeFilter = 'primary' | 'secondary' | 'none' | null;

export default function History() {
  const { provider } = useChainData();

  const params = useQueryParams();
  const history = useHistory();

  const currentPage = parseInt(params.get('page') || '1', 10);
  const filter = getValidatedTypeFilter(params.get('type'));

  const { data, totalResults, status } = useProposals(currentPage, {
    active: false,
    type: filter,
  });

  useTreasuryAndDelegation();

  const handleFilterChange = (checkedPrimary: boolean, checkedSecondary: boolean) => {
    if (checkedPrimary && !checkedSecondary) {
      history.replace(`/history?type=primary`);
    } else if (checkedSecondary && !checkedPrimary) {
      history.replace(`/history?type=secondary`);
    } else if (!checkedPrimary && !checkedSecondary) {
      history.replace(`/history?type=none`);
    } else {
      history.replace(`/history`);
    }
  };

  const checkedPrimary = !filter || filter === 'primary';
  const checkedSecondary = !filter || filter === 'secondary';

  const unconnected = !provider;
  return (
    <BaseLayout subtitle="History">
      <div className={styles.header}>
        <Header title="History"></Header>
      </div>

      <BorderedBox
        header={
          <div className={styles.borderBoxHeader}>
            <h5>Past Proposals</h5>
            <div className={styles.radioButtons}>
              <RadioButton
                onChange={() => handleFilterChange(!checkedPrimary, checkedSecondary)}
                label="Primary"
                checked={checkedPrimary}
                color="white"
                type="checkbox"
              />
              <RadioButton
                onChange={() => handleFilterChange(checkedPrimary, !checkedSecondary)}
                label="Secondary"
                checked={checkedSecondary}
                color="white"
                type="checkbox"
              />
            </div>
          </div>
        }
        content={
          unconnected ? (
            <EmptyState>
              <span>You need to be connected to view proposals</span>
              <ConnectButton variant="link">Connect your wallet</ConnectButton>
            </EmptyState>
          ) : data ? (
            <>
              {totalResults > 0 ? (
                <>
                  <ProposalList proposals={data} />
                  <Pagination totalResults={totalResults} currentPage={currentPage} className={styles.pagination} />
                </>
              ) : (
                <EmptyState>{getNoResultsMessage(filter)}</EmptyState>
              )}
            </>
          ) : (
            <EmptyState>{status === 'loading' && <p>Loading...</p>}</EmptyState>
          )
        }
        noMobileBorders
      />
    </BaseLayout>
  );
}

function getValidatedTypeFilter(value: string | null): TypeFilter {
  switch (value) {
    case 'primary':
    case 'secondary':
    case null:
      return value;
    default:
      return 'none';
  }
}

function getNoResultsMessage(filter: TypeFilter) {
  switch (filter) {
    case 'none':
      return 'Please select a filter';
    case null:
      return 'There are no past proposals';
    default:
      return `There are no ${filter} past proposals`;
  }
}
