import { useState } from 'react';
import { Address, useEnsName } from 'wagmi';
import { BigNumber } from 'ethers';
import classNames from 'classnames';
import { NavLink } from 'react-router-dom';
import { format } from 'date-fns';
import { Proposal, useChainData } from '../../../chain-data';
import { images } from '../../../utils';
import { encodeProposalTypeAndVoteId } from '../../../logic/proposals/encoding';
import VoteSlider from '../vote-slider/vote-slider';
import Timer, { DATE_FORMAT } from '../../../components/timer';
import ConnectButton from '../../../components/connect-button';
import { Tooltip } from '../../../components/tooltip';
import { voteSliderSelector } from '../../../logic/proposals/selectors';
import ProposalTag from '../proposal-tag';
import styles from './proposal-list.module.scss';
import ProposalStatus from './proposal-status/proposal-status';

interface Props {
  // Proposals should be sorted by priority (the topmost proposal in the list has index 0). Or undefined if user is not
  // logged in.
  proposals: Proposal[] | undefined;
  type: 'active' | 'past';
}

interface ProposalProps {
  proposal: Proposal;
  device: 'mobile' | 'desktop';
}

const voteIdFormat = (voteId: BigNumber) => {
  return voteId.toString();
};

const ProposalInfoState = ({ proposal, device }: ProposalProps) => {
  const tooltipContent =
    proposal.type === 'primary'
      ? `Primary-type proposals need ${proposal.minAcceptQuorum}% quorum to pass`
      : `Secondary-type proposals need ${proposal.minAcceptQuorum}% quorum to pass`;

  const proposalId = `#${voteIdFormat(proposal.voteId)}`;

  return (
    <div
      className={classNames(styles.proposalItemBox, {
        [styles.desktop]: device === 'desktop',
        [styles.mobile]: device === 'mobile',
      })}
    >
      <ProposalStatus proposal={proposal} />
      <div className={styles.proposalItemTag}>
        <Tooltip overlay={tooltipContent}>
          <span>
            <ProposalTag type={proposal.type} id={proposalId} />
          </span>
        </Tooltip>
      </div>
    </div>
  );
};

const ProposalList = (props: Props) => {
  const { type, proposals } = props;

  const { provider } = useChainData();
  if (!provider) {
    return (
      <div className={styles.noProposals}>
        <span>You need to be connected to view proposals</span>
        <ConnectButton type="link-blue" size="sm" md={{ size: 'lg' }}>
          Connect your wallet
        </ConnectButton>
      </div>
    );
  } else if (!proposals) {
    // TODO: Use loading skeleton
    return <p className={styles.noProposals}>Loading...</p>;
  } else if (proposals.length === 0) {
    return <p className={styles.noProposals}>There are no {type} proposals</p>;
  } else {
    return (
      <div className={styles.proposalsList}>
        {proposals.map((proposal, index) => {
          const typeAndVoteId = encodeProposalTypeAndVoteId(proposal.type, voteIdFormat(proposal.voteId));
          const href = `/${proposal.open ? 'governance' : 'history'}/${typeAndVoteId}`;
          return <ProposalListItem key={typeAndVoteId} proposal={proposal} href={href} index={index} />;
        })}
      </div>
    );
  }
};

export default ProposalList;

interface ProposalListItemProps {
  proposal: Proposal;
  href: string;
  index: number;
}

function ProposalListItem(props: ProposalListItemProps) {
  const { proposal, href, index } = props;

  const votingSliderData = voteSliderSelector(proposal);

  // Preload the first 10 proposals' creator ENS name by default
  const [preload, setPreload] = useState(index < 10);
  useEnsName({
    address: proposal.creator as Address,
    enabled: preload,
  });

  return (
    <div className={styles.proposalItem} data-cy="proposal-item" onMouseEnter={() => setPreload(true)}>
      <div className={styles.proposalItemWrapper}>
        <ProposalInfoState proposal={proposal} device="mobile" />
        <p className={styles.proposalItemTitle}>
          <NavLink to={href}>{proposal.metadata.title}</NavLink>
        </p>
        <div className={styles.proposalItemSubtitle}>
          <ProposalInfoState proposal={proposal} device="desktop" />
          <div className={styles.proposalItemBox}>
            {/* TODO: Probably show deadline instead of startDate, see: https://api3workspace.slack.com/archives/C020RCCC3EJ/p1622639292015100?thread_ts=1622620763.004400&cid=C020RCCC3EJ */}
            {proposal.open ? <Timer deadline={proposal.deadline} /> : format(proposal.startDate, DATE_FORMAT)}
          </div>
        </div>
      </div>

      <div className={styles.proposalVoteBar}>
        <VoteSlider {...votingSliderData} />
        <span className={styles.proposalVoteArrow}>
          <NavLink to={href}>
            <img src={images.arrowRight} alt="right arrow" />
          </NavLink>
        </span>
      </div>
    </div>
  );
}
