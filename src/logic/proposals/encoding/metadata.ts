/**
 * In order to decode an encoded proposal script one needs to have the signatures of the functions, which we need to
 * store in form of metadata. We also use metadata to store other proposal information like title and details.
 *
 * @see newVote in Api3Voting.sol for more details
 */
import { ProposalMetadata } from '../../../chain-data';
import { NewProposalFormData } from './types';

/**
 * The current version of metadata scheme.
 *
 * We version metadata schemes to allow simpler updates to the scheme in the future (e.g. if we decide to support
 * multiple EVM proposal calls).
 */
const METADATA_SCHEME_VERSION = '1';
/**
 * The metadata scheme simply takes multiple values and inserts a non printable character used to separate words between
 * each of the values. The delimeter can't be written by user, however nothing prevents people from creating proposals
 * directly (not using DAO dashboard) and they can use whatever metadata scheme they want.
 *
 * More information:
 * https://stackoverflow.com/questions/492090/least-used-delimiter-character-in-normal-text-ascii-128/41555511#41555511
 */
export const METADATA_DELIMETER = String.fromCharCode(31);

/**
 * Encodes the form data according to the metadata scheme.
 *
 * @param formData the form data to be encoded
 */
export const encodeMetadata = (formData: NewProposalFormData) =>
  [METADATA_SCHEME_VERSION, formData.targetSignature, formData.title, formData.description].join(METADATA_DELIMETER);

/**
 * Receives an encoded metadata and returns the decoded metadata fields.
 *
 * @param metadata encoded metadata which is to be decoded
 */
export const decodeMetadata = (metadata: string): ProposalMetadata | null => {
  const tokens = metadata.split(METADATA_DELIMETER);
  // Metadata encoding is just a convention and people might create proposals directly via the contract, so we need to
  // validate if the metadata has correct format.
  if (tokens.length !== 4) return null;
  return { version: tokens[0]!, targetSignature: tokens[1]!, title: tokens[2]!, description: tokens[3]! };
};
