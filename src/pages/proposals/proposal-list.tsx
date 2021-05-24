import { useMemo } from 'react';
import { differenceInMinutes } from 'date-fns';
import { useChainData } from '../../chain-data';
import { NavLink } from 'react-router-dom';
import { encodeProposalTypeAndId } from '../../logic/proposals/encoding';
import VoteSlider from '../../components/vote-slider/vote-slider';
import { voteSliderSelector } from '../../logic/proposals/selectors';

const VOTER_STATES = { 0: 'Unvoted', 1: 'Voted For', 2: 'Voted Against' };

const ProposalList = () => {
  const { proposalState } = useChainData();

  const allProposals = useMemo(() => {
    const primaryProposals = proposalState?.primary.proposals || [];
    const secondaryProposals = proposalState?.secondary.proposals || [];

    return [...primaryProposals, ...secondaryProposals].sort((p1, p2) =>
      p1.startDateRaw.lt(p2.startDateRaw) ? -1 : 1
    );
  }, [proposalState?.primary.proposals, proposalState?.secondary.proposals]);

  return (
    <>
      <p>Proposal list</p>
      {allProposals.map((p) => {
        const votingSliderData = voteSliderSelector(p);

        return (
          <div style={{ border: '1px solid gray' }} key={`${p.type}-${p.voteId.toString()}`}>
            <h5>{p.metadata.description}</h5>
            <p>
              #{p.voteId.toString()} {VOTER_STATES[p.voterState]}
            </p>
            <p>Start date: {p.startDate.toUTCString()}</p>
            <p>Deadline: {p.deadline.toUTCString()}</p>
            <p>Remaining minutes: {differenceInMinutes(p.deadline, new Date())}</p>
            <p>{p.type}</p>

            <NavLink to={`/proposals/${encodeProposalTypeAndId(p.type, p.voteId.toString())}`}>
              <button>details</button>
            </NavLink>

            <div style={{ width: 300, margin: 'auto', marginRight: 50 }}>
              <VoteSlider {...votingSliderData} />
            </div>
          </div>
        );
      })}
    </>
  );
};

export default ProposalList;
