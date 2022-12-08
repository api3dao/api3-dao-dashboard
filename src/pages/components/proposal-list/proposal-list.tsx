import { ReactNode, useEffect, useRef } from 'react';
import { go } from '@api3/promise-utils';
import classNames from 'classnames';
import { NavLink } from 'react-router-dom';
import { format } from 'date-fns';
import { produceState, Proposal, ProposalMetadata, ProposalType, useChainData } from '../../../chain-data';
import { images, useStableIds } from '../../../utils';
import { decodeEvmScript, encodeProposalTypeAndVoteId } from '../../../logic/proposals/encoding';
import VoteSlider from '../vote-slider/vote-slider';
import Timer, { DATE_FORMAT } from '../../../components/timer';
import { Tooltip } from '../../../components/tooltip';
import { voteSliderSelector } from '../../../logic/proposals/selectors';
import Tag from '../../../components/tag';
import globalStyles from '../../../styles/global-styles.module.scss';
import styles from './proposal-list.module.scss';
import ProposalStatus from './proposal-status/proposal-status';
import Skeleton from '../../../components/skeleton';
import uniq from 'lodash/uniq';
import { convertToEnsName } from '../../../logic/proposals/encoding/ens-name';
import { ProposalSkeleton } from '../../../logic/proposals/data';

interface Props {
  proposals: (ProposalSkeleton | Proposal)[];
}

export default function ProposalList(props: Props) {
  const { proposals } = props;

  useEvmScriptPreload(proposals);
  useEnsNamesPreload(proposals);

  return (
    <>
      {proposals.map((proposal) => {
        const navlink = {
          base: proposal.open ? 'governance' : 'history',
          typeAndVoteId: encodeProposalTypeAndVoteId(proposal.type, proposal.voteId),
        };

        if ('deadline' in proposal) {
          const votingSliderData = voteSliderSelector(proposal);
          return (
            <div className={styles.proposalItem} key={navlink.typeAndVoteId} data-cy="proposal-item">
              <div className={styles.proposalItemWrapper}>
                <ProposalInfoState proposal={proposal} device="mobile" />
                <p className={styles.proposalItemTitle}>
                  <NavLink to={`/${navlink.base}/${navlink.typeAndVoteId}`}>{proposal.metadata.title}</NavLink>
                </p>
                <div className={styles.proposalItemSubtitle}>
                  <ProposalInfoState proposal={proposal} device="desktop" />
                  <div className={styles.proposalItemBox}>
                    {proposal.open ? <Timer deadline={proposal.deadline} /> : format(proposal.startDate, DATE_FORMAT)}
                  </div>
                </div>
              </div>

              <div className={styles.proposalVoteBar}>
                <VoteSlider {...votingSliderData} />
                <span className={styles.proposalVoteArrow}>
                  <NavLink to={`/${navlink.base}/${navlink.typeAndVoteId}`}>
                    <img src={images.arrowRight} alt="right arrow" />
                  </NavLink>
                </span>
              </div>
            </div>
          );
        }

        return (
          <div className={styles.proposalItem} key={navlink.typeAndVoteId} data-cy="proposal-item">
            <div className={styles.proposalItemWrapper}>
              <div className={styles.skeletonMobile} style={{ maxWidth: '50%', height: 32 }}>
                <Skeleton />
              </div>
              <p className={styles.proposalItemTitle} style={{ opacity: '0.7' }}>
                <NavLink to={`/${navlink.base}/${navlink.typeAndVoteId}`}>{proposal.metadata?.title}</NavLink>
              </p>
              <div className={styles.proposalItemSubtitle}>
                <Skeleton />
                <div className={styles.proposalItemBox}></div>
              </div>
            </div>

            <div className={styles.proposalVoteBar}>
              <Skeleton />
              <span className={styles.proposalVoteArrow}>
                <NavLink to={`/${navlink.base}/${navlink.typeAndVoteId}`}>
                  <img src={images.arrowRight} alt="right arrow" />
                </NavLink>
              </span>
            </div>
          </div>
        );
      })}
    </>
  );
}

export function EmptyState(props: { children: ReactNode }) {
  return <div className={styles.noProposals}>{props.children}</div>;
}

interface ProposalProps {
  proposal: Proposal;
  device: 'mobile' | 'desktop';
}

const ProposalInfoState = ({ proposal, device }: ProposalProps) => {
  const tooltipContent =
    proposal.type === 'primary'
      ? `Primary-type proposals need ${proposal.minAcceptQuorum}% quorum to pass`
      : `Secondary-type proposals need ${proposal.minAcceptQuorum}% quorum to pass`;

  const proposalId = `#${proposal.voteId} ${proposal.type}`;

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

function useEnsNamesPreload(proposals: { creator: string }[]) {
  const { provider, ensNamesByAddress, setChainData } = useChainData();

  const proposalsToPreload = proposals.filter((prop) => {
    return ensNamesByAddress[prop.creator] === undefined;
  });

  const addresses = useStableIds(proposalsToPreload, (p) => p.creator);

  useEffect(() => {
    if (!provider || !addresses.length) return;

    const load = async () => {
      const result = await go(() => Promise.all(uniq(addresses).map((address) => convertToEnsName(provider, address))));
      if (result.success) {
        setChainData(
          'Preloaded ENS names',
          produceState((draft) => {
            addresses.forEach((address, index) => {
              draft.ensNamesByAddress[address] = result.data[index]!;
            });
          })
        );
      }
    };

    load();
  }, [provider, addresses, setChainData]);
}

function useEvmScriptPreload(
  proposals: { voteId: string; type: ProposalType; script?: string; metadata: ProposalMetadata }[]
) {
  const { provider, proposalData, setChainData } = useChainData();

  const proposalsToPreload = proposals.filter((prop) => {
    return prop.script && proposalData[prop.type].decodedEvmScriptById[prop.voteId] === undefined;
  });

  const voteIds = useStableIds(proposalsToPreload, (p) => p.voteId);

  const dataRef = useRef(proposalsToPreload);
  useEffect(() => {
    dataRef.current = proposalsToPreload;
  });

  useEffect(() => {
    if (!provider || !voteIds.length) return;

    const data = dataRef.current;

    const load = async () => {
      const result = await Promise.all(
        data.map(async (proposal) => {
          return await decodeEvmScript(provider, proposal.script!, proposal.metadata);
        })
      );

      setChainData(
        'Preloaded EVM scripts',
        produceState((draft) => {
          data.forEach((p, index) => {
            draft.proposalData[p.type].decodedEvmScriptById[p.voteId] = result[index]!;
          });
        })
      );
    };

    load();
  }, [provider, voteIds, setChainData]);
}
