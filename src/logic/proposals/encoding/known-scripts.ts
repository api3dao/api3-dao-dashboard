import { utils } from 'ethers';

/**
 * Metadata version 3 is reserved for the DAO migration proposal, which performs several calls in its EVM script. Such a
 * proposal is only decoded and shown when its EVM script is one of these, identified by the keccak256 hash of the
 * script bytes in lowercase. Anything else is treated as a proposal the dashboard cannot display, like before this
 * version existed. The list is edited by hand when the proposal is about to be posted, so what the dashboard shows is a
 * script that was reviewed and nothing else. A local preview edits it the same way.
 */
export const KNOWN_MULTI_CALL_SCRIPT_HASHES: string[] = [];

/**
 * Whether the script of a proposal is one of the known ones.
 */
export const isKnownMultiCallScript = (script: string) =>
  KNOWN_MULTI_CALL_SCRIPT_HASHES.includes(utils.keccak256(script));
