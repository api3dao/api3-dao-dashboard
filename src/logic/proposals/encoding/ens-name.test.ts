import type { providers } from 'ethers';

import { convertToAddressOrThrow, tryConvertToEnsName } from './ens-name';

const MOCKED_ENS_ENTRY = { ensName: 'api3-mocked.eth', address: '0xe97D5D255Dc4458477f7E435c3aF0d8bd07231eA' };
const mockedProvider: providers.JsonRpcProvider = {
  resolveName: async (name: string) => {
    return name === MOCKED_ENS_ENTRY.ensName ? MOCKED_ENS_ENTRY.address : null;
  },
  lookupAddress: async (address: string) => {
    return address === MOCKED_ENS_ENTRY.address ? MOCKED_ENS_ENTRY.ensName : null;
  },
} as any;

test('convertToAddressOrThrow', async () => {
  await expect(convertToAddressOrThrow(mockedProvider, MOCKED_ENS_ENTRY.ensName)).resolves.toBe(
    MOCKED_ENS_ENTRY.address
  );

  const address = '0x2ec3E3e8a7E775E07b051E925C49Ed27862bf21d';
  await expect(convertToAddressOrThrow(mockedProvider, address)).resolves.toBe(address);

  await expect(async () => convertToAddressOrThrow(mockedProvider, 'unknown-name.eth')).rejects.toThrow(
    'ENS name "unknown-name.eth" does not exist'
  );
});

test('tryConvertToEnsName', async () => {
  await expect(tryConvertToEnsName(mockedProvider, MOCKED_ENS_ENTRY.address)).resolves.toBe(MOCKED_ENS_ENTRY.ensName);

  const address = '0x2ec3E3e8a7E775E07b051E925C49Ed27862bf21d';
  await expect(tryConvertToEnsName(mockedProvider, address)).resolves.toBe(address);

  await expect(tryConvertToEnsName(mockedProvider, 'anything-but-address')).resolves.toBe('anything-but-address');
});
