import { BigNumber } from 'ethers';
import classNames from 'classnames';
import { NavLink } from 'react-router-dom';
import { format } from 'date-fns';
import { Proposal, useChainData } from '../../../chain-data';
import { images } from '../../../utils';
import { encodeProposalTypeAndId } from '../../../logic/proposals/encoding';
import VoteSlider from '../vote-slider/vote-slider';
import Timer, { DATE_FORMAT } from '../../../components/timer/timer';
import Button from '../../../components/button/button';
import Tooltip from '../../../components/tooltip/tooltip';
import { voteSliderSelector } from '../../../logic/proposals/selectors';
import Tag from '../../../components/tag/tag';
import globalStyles from '../../../styles/global-styles.module.scss';
import styles from './proposal-list.module.scss';
import ProposalStatus from './proposal-status/proposal-status';
import { connectWallet } from '../../../components/sign-in/sign-in';

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

  const proposalId = `#${voteIdFormat(proposal.voteId)} ${proposal.type}`;

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
            <Tag type={proposal.type}>
              <span className={globalStyles.capitalize}>{proposalId}</span>
            </Tag>
          </span>
        </Tooltip>
      </div>
    </div>
  );
};

const ProposalList = (props: Props) => {
  const { proposals, type } = props;
  const { setChainData } = useChainData();

  return (
    <>
      {!proposals && (
        <div className={styles.noProposals}>
          <span>You need to be connected to view proposals</span>
          <Button type="link" onClick={connectWallet(setChainData)}>
            Connect your wallet
          </Button>
        </div>
      )}
      {proposals?.length === 0 && <p className={styles.noProposals}>There are no {type} proposals</p>}
      {proposals?.map((p) => {
        const votingSliderData = voteSliderSelector(p);
        const navlink = {
          base: p.open ? 'governance' : 'history',
          typeAndId: encodeProposalTypeAndId(p.type, voteIdFormat(p.voteId)),
        };

        return (
          <div className={styles.proposalItem} key={`${p.type}-${voteIdFormat(p.voteId)}`} data-cy="proposal-item">
            <div className={styles.proposalItemWrapper}>
              <ProposalInfoState proposal={p} device="mobile" />
              <p className={styles.proposalItemTitle}>
                <NavLink to={`/${navlink.base}/${navlink.typeAndId}`}>{p.metadata.title}</NavLink>
              </p>
              <div className={styles.proposalItemSubtitle}>
                <ProposalInfoState proposal={p} device="desktop" />
                <div className={styles.proposalItemBox}>
                  {/* TODO: Probably show deadline instead of startDate, see: https://api3workspace.slack.com/archives/C020RCCC3EJ/p1622639292015100?thread_ts=1622620763.004400&cid=C020RCCC3EJ */}
                  {p.open ? <Timer deadline={p.deadline} /> : format(p.startDate, DATE_FORMAT)}
                </div>
              </div>
            </div>

            <div className={styles.proposalVoteBar}>
              <VoteSlider {...votingSliderData} />
              <span className={styles.proposalVoteArrow}>
                <NavLink to={`/${navlink.base}/${navlink.typeAndId}`}>
                  <img src={images.arrowRight} alt="right arrow" />
                </NavLink>
              </span>
            </div>
          </div>
        );
      })}
    </>
  );
};

export default ProposalList;
