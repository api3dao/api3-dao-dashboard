import { utils } from 'ethers';
import { ProposalType } from '../../../chain-data';

/**
 * Metadata version 3 is reserved for the DAO migration proposal, which performs several calls in its EVM script. Such a
 * proposal is only decoded and shown when its EVM script is one of these, identified by the keccak256 hash of the
 * script bytes in lowercase, and when it is a proposal of the voting app below. Anything else is treated as a proposal
 * the dashboard cannot display, like before this version existed. The list is edited by hand when the proposal is about to be posted, so what the dashboard shows is a
 * script that was reviewed and nothing else. A local preview edits it the same way.
 */
export const KNOWN_MULTI_CALL_SCRIPT_HASHES: string[] = [
  // The 200,000,000 API3 proposal, built at block 26297075
  '0xd43e2dfeaea2e20c47dedf08405bc3483218dabd87643a0b9ddf3df5a390cf64',
];

/**
 * The voting app the known scripts belong to. The DAO migration proposal is a primary proposal, and the same script
 * posted to the secondary voting app is not the reviewed proposal.
 */
export const KNOWN_MULTI_CALL_PROPOSAL_TYPE: ProposalType = 'primary';

/**
 * Whether the script of a proposal is one of the known ones. The known hashes are a parameter so that tests pass their
 * own instead of editing the list.
 */
export const isKnownMultiCallScript = (
  script: string,
  type: ProposalType,
  knownScriptHashes: string[] = KNOWN_MULTI_CALL_SCRIPT_HASHES
) => type === KNOWN_MULTI_CALL_PROPOSAL_TYPE && knownScriptHashes.includes(utils.keccak256(script));
