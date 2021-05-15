import { useMemo } from 'react';
import { differenceInMinutes } from 'date-fns';
import { Proposal, useChainData } from '../../chain-data';

const VOTER_STATES = { 0: 'Unvoted', 1: 'Voted For', 2: 'Voted Against' };

const ProposalList = () => {
  const { proposalState } = useChainData();

  const allProposals = useMemo(() => {
    const primaryProposals = proposalState?.primary.proposals || [];
    const secondaryProposals = proposalState?.secondary.proposals || [];
    const addType = (type: string) => (p: Proposal) => ({ ...p, type });

    return [
      ...primaryProposals.map(addType('Primary')),
      ...secondaryProposals.map(addType('Secondary')),
    ].sort((p1, p2) => (p1.startDateRaw.lt(p2.startDateRaw) ? -1 : 1));
  }, [proposalState?.primary.proposals, proposalState?.secondary.proposals]);

  console.log(
    allProposals.map((p) => ({
      minAcceptQuorum: p.minAcceptQuorum.toString(),
      supportRequired: p.supportRequired.toString(),
      yea: p.yea.toString(),
      nay: p.nay.toString(),
      votingPower: p.votingPower.toString(),
    }))
  );

  return (
    <>
      <p>Proposal list</p>
      {allProposals.map((p) => (
        <div style={{ border: '1px solid gray' }} key={p.voteId.toString()}>
          <h5>{p.metadata.description}</h5>
          <p>
            #{p.voteId.toString()} {VOTER_STATES[p.voterState]}
          </p>
          <p>Start date: {p.startDate.toUTCString()}</p>
          <p>Deadline: {p.deadline.toUTCString()}</p>
          <p>Remaining minutes: {differenceInMinutes(p.deadline, new Date())}</p>
          <p>{p.type}</p>

          {/* TODO: create data for the slider component */}
          {/* _canExecute in Api3Voting.sol */}
          {/* https://api3workspace.slack.com/archives/C020RCCC3EJ/p1621103766015200 */}
        </div>
      ))}
    </>
  );
};

export default ProposalList;
