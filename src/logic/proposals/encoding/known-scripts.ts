import { utils } from 'ethers';

/**
 * A proposal created outside of the DAO dashboard (metadata version 3) is only decoded and shown when its EVM script is
 * one of these, identified by the keccak256 hash of the script bytes. Anything else is treated as a proposal the
 * dashboard cannot display, like before this version existed. The list is edited by hand when such a proposal is about
 * to be posted, so what the dashboard shows is a script that was reviewed and nothing else.
 */
export const KNOWN_MULTI_CALL_SCRIPT_HASHES: string[] = [];

/**
 * Whether the script of a proposal is one of the known ones. In development, VITE_MULTI_CALL_SCRIPT_HASH names one
 * more, so that a proposal on a local chain can be previewed without editing the list.
 */
export const isKnownMultiCallScript = (script: string) => {
  const hash = utils.keccak256(script);
  if (KNOWN_MULTI_CALL_SCRIPT_HASHES.includes(hash)) return true;

  const developmentHash = import.meta.env.VITE_MULTI_CALL_SCRIPT_HASH;
  return import.meta.env.VITE_NODE_ENV === 'development' && !!developmentHash && developmentHash.toLowerCase() === hash;
};
