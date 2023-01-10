import { produceState, Proposal, useChainData } from '../../chain-data';
import { useStableIds } from '../../utils';
import { useEffect } from 'react';
import uniq from 'lodash/uniq';
import { go } from '@api3/promise-utils';
import { convertToEnsName } from './encoding/ens-name';
import { decodeEvmScript } from './encoding';
import { ProposalSkeleton } from './types';

/**
 * Preloads the names for the creator addresses of the given proposals. Addresses that have already been loaded
 * will be skipped.
 */
export function useCreatorNamePreload(proposals: (ProposalSkeleton | Proposal)[]) {
  const { provider, ensNamesByAddress, setChainData } = useChainData();

  const proposalsToPreload = proposals.filter((prop) => {
    return ensNamesByAddress[prop.creator] === undefined;
  });

  const addresses = useStableIds(proposalsToPreload, (p) => p.creator);

  useEffect(() => {
    if (!provider || !addresses.length) return;

    const load = async () => {
      const uniqAddresses = uniq(addresses); // Make sure not to make multiple requests for the same address

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

/**
 * Preloads the decoding of the EVM script for the given proposals. EVM scrips that have already been decoded
 * will be skipped.
 */
export function useEvmScriptPreload(proposals: (ProposalSkeleton | Proposal)[]) {
  const { provider, proposals: proposalData, setChainData } = useChainData();

  // The raw EVM script isn't included in the ProposalSkeleton, so we need to filter out the skeletons
  const proposalsToPreload = proposals.filter((prop): prop is Proposal => {
    return 'script' in prop && proposalData[prop.type].decodedEvmScriptById[prop.voteId] === undefined;
  });

  const voteIdsToPreload = useStableIds(proposalsToPreload, (p) => p.voteId);

  useEffect(
    () => {
      if (!provider || !voteIdsToPreload.length) return;

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
    },
    // We omit proposalsToPreload from the dependencies as it would cause the effect to trigger on every render.
    // We use the vote IDs rather to trigger the effect when needed.
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [provider, voteIdsToPreload, setChainData]
  );
}