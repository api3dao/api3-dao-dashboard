import { providers, utils } from 'ethers';
import { go, GO_RESULT_INDEX, isGoSuccess } from '../../../utils';

/**
 * Converts the value to ethereum address. Throws error if the value is not an address nor ENS name.
 *
 * @param provider a provider for doing the ENS lookup
 * @param ensNameOrAddress address or ENS name to be converted
 */
export const convertToAddressOrThrow = async (provider: providers.Provider, ensNameOrAddress: string) => {
  if (utils.isAddress(ensNameOrAddress)) return ensNameOrAddress;

  // NOTE: Ethers typings are wrong and "lookupAddress" returns "null" when the ENS name does not exist
  const resolved = await provider.resolveName(ensNameOrAddress);
  if (!utils.isAddress(resolved)) throw Error(`ENS name "${ensNameOrAddress}" does not exist`);
  return resolved;
};

/**
 * Converts the address to ENS name. If the value passed is not an address or there is no ENS name registered for it,
 * the function returns the value itself.
 *
 * @param provider a provider for doing the ENS lookup
 * @param ensNameOrAddress address or ENS name to be converted
 */
export const tryConvertToEnsName = async (provider: providers.Provider, ensNameOrAddress: string) => {
  if (!utils.isAddress(ensNameOrAddress)) return ensNameOrAddress;

  const goEnsName = await go(provider.lookupAddress(ensNameOrAddress));
  if (!isGoSuccess(goEnsName)) return ensNameOrAddress;

  // NOTE: Ethers typings are wrong and "lookupAddress" returns "null" when the ENS name does not exist
  const ensName = goEnsName[GO_RESULT_INDEX];
  return ensName || ensNameOrAddress;
};
