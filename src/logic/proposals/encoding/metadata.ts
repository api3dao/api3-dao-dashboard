import { ProposalMetadata } from '../../../chain-data';
import { NewProposalFormData } from './types';

const METADATA_FORMAT_VERSION = '1';
// https://stackoverflow.com/questions/492090/least-used-delimiter-character-in-normal-text-ascii-128/41555511#41555511
export const METADATA_DELIMETER = String.fromCharCode(31);

export const encodeMetadata = (formData: NewProposalFormData) =>
  [METADATA_FORMAT_VERSION, formData.targetSignature, formData.title, formData.description].join(METADATA_DELIMETER);

export const decodeMetadata = (metadata: string): ProposalMetadata | null => {
  const tokens = metadata.split(METADATA_DELIMETER);
  // NOTE: Our metadata encoding is just a convention and people might create proposals directly via the contract. They
  // shouldn't do it and we will probably just ignore their proposal created this way.
  if (tokens.length !== 4) return null;
  return { version: tokens[0]!, targetSignature: tokens[1]!, title: tokens[2]!, description: tokens[3]! };
};
