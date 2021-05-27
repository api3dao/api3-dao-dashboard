import { useMemo } from 'react';
import { useChainData } from '../../../chain-data';
import { NavLink } from 'react-router-dom';
import { encodeProposalTypeAndId } from '../../../logic/proposals/encoding';
import VoteSlider from '../../../components/vote-slider/vote-slider';
import Timer from '../../../components/timer/timer';
import Tooltip from '../../../components/tooltip/tooltip';
import { voteSliderSelector } from '../../../logic/proposals/selectors';
import Tag from '../../../components/tag/tag';
import './proposal-list.scss';

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
      {allProposals.map((p) => {
        const votingSliderData = voteSliderSelector(p);
        const tooltipContent =
          p.type === 'primary'
            ? 'Primary proposals require an absolute majority to execute.'
            : 'Secondary proposals need 15% to execute.';

        return (
          <div className="proposal-item" key={`${p.type}-${p.voteId.toString()}`}>
            <div className="proposal-item-wrapper medium">
              <p className="proposal-item-title">{p.metadata.description}</p>
              <div className="proposal-item-subtitle text-xsmall">
                <div className="proposal-item-box _mr-lg">
                  <p className="proposal-item-voteId tertiary-color">#{p.voteId.toString()}</p>
                  <p className="proposal-item-voter-states">{VOTER_STATES[p.voterState]}</p>
                </div>
                <div className="proposal-item-box _date">
                  <Timer start={p.startDate} deadline={p.deadline} />
                </div>
                <div className="proposal-item-box">
                  <Tooltip content={tooltipContent}>
                    <Tag type={p.type}>
                      <span className="capitalize">{p.type}</span>
                    </Tag>
                  </Tooltip>
                </div>
              </div>
            </div>

            <div className="proposal-item-voteBar">
              <VoteSlider {...votingSliderData} />
              <NavLink to={`/proposals/${encodeProposalTypeAndId(p.type, p.voteId.toString())}`}>
                <img src="/arrow-right.svg" alt="right arrow" />
              </NavLink>
            </div>
          </div>
        );
      })}
    </>
  );
};

export default ProposalList;
