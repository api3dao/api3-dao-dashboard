import Layout from '../../components/layout/layout';
import { useQueryParams } from '../../utils';
import { ProposalType } from '../../chain-data/state';

type OptionalProposalType = ProposalType | null;
const getValidatedProposalType = (typeFromUrl: string | null): OptionalProposalType => {
  if (typeFromUrl && ['primary', 'secondary'].includes(typeFromUrl)) return typeFromUrl as ProposalType;
  else return null;
};

const History = () => {
  const params = useQueryParams();
  const proposalType = getValidatedProposalType(params.get('type'));

  return (
    <Layout title="History" sectionTitle="History">
      <div>history</div>
      {proposalType && (
        <div>
          showing only <b>{proposalType}</b>
        </div>
      )}
    </Layout>
  );
};

export default History;
