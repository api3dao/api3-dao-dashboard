import { produceState, Proposal, useChainData } from '../../chain-data';
import { useStableIds } from '../../utils';
import { useEffect, useRef } from 'react';
import uniq from 'lodash/uniq';
import { go } from '@api3/promise-utils';
import { convertToEnsName } from './encoding/ens-name';
import { decodeEvmScript } from './encoding';
import { ProposalSkeleton } from './types';

export function useCreatorNamePreload(proposals: (ProposalSkeleton | Proposal)[]) {
  const { provider, ensNamesByAddress, setChainData } = useChainData();

  const proposalsToPreload = proposals.filter((prop) => {
    return ensNamesByAddress[prop.creator] === undefined;
  });

  const addresses = useStableIds(proposalsToPreload, (p) => p.creator);

  useEffect(() => {
    if (!provider || !addresses.length) return;

    const load = async () => {
      const uniqAddresses = uniq(addresses);

      const result = await go(() =>
        Promise.all(
          uniqAddresses.map(async (address) => {
            const name = await convertToEnsName(provider, address);
            return { address, name };
          })
        )
      );

      if (result.success) {
        setChainData(
          'Preloaded ENS names',
          produceState((draft) => {
            result.data.forEach((res) => {
              draft.ensNamesByAddress[res.address] = res.name;
            });
          })
        );
      }
    };

    load();
  }, [provider, addresses, setChainData]);
}

export function useEvmScriptPreload(proposals: (ProposalSkeleton | Proposal)[]) {
  const { provider, proposals: proposalData, setChainData } = useChainData();

  const proposalsToPreload = proposals.filter((prop): prop is Proposal => {
    return 'script' in prop && proposalData[prop.type].decodedEvmScriptById[prop.voteId] === undefined;
  });

  const voteIds = useStableIds(proposalsToPreload, (p) => p.voteId);

  const dataRef = useRef(proposalsToPreload);
  useEffect(() => {
    dataRef.current = proposalsToPreload;
  });

  useEffect(() => {
    if (!provider || !voteIds.length) return;

    const proposalsToPreload = dataRef.current;

    const load = async () => {
      const result = await go(() =>
        Promise.all(
          proposalsToPreload.map(async (prop) => {
            const decodedEvmScript = await decodeEvmScript(provider, prop.script, prop.metadata);
            return { voteId: prop.voteId, type: prop.type, decodedEvmScript };
          })
        )
      );

      if (result.success) {
        setChainData(
          'Preloaded EVM scripts',
          produceState((draft) => {
            result.data.forEach((res) => {
              draft.proposals[res.type].decodedEvmScriptById[res.voteId] = res.decodedEvmScript;
            });
          })
        );
      }
    };

    load();
  }, [provider, voteIds, setChainData]);
}
