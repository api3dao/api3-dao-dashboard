import { providers } from 'ethers';
import { convertToAddressOrThrow, tryConvertToEnsName } from './ens-name';

const MOCKED_ENS_ENTRY = { ensName: 'api3-mocked.eth', address: '0xe97D5D255Dc4458477f7E435c3aF0d8bd07231eA' };
const mockedProvider: providers.JsonRpcProvider = {
  resolveName: (name: string) => {
    return Promise.resolve(name === MOCKED_ENS_ENTRY.ensName ? MOCKED_ENS_ENTRY.address : null);
  },
  lookupAddress: (address: string) => {
    return Promise.resolve(address === MOCKED_ENS_ENTRY.address ? MOCKED_ENS_ENTRY.ensName : null);
  },
} as any;

test('convertToAddressOrThrow', async () => {
  expect(await convertToAddressOrThrow(mockedProvider, MOCKED_ENS_ENTRY.ensName)).toBe(MOCKED_ENS_ENTRY.address);

  const address = '0x2ec3E3e8a7E775E07b051E925C49Ed27862bf21d';
  expect(await convertToAddressOrThrow(mockedProvider, address)).toBe(address);

  await expect(() => convertToAddressOrThrow(mockedProvider, 'unknown-name.eth')).rejects.toThrowError(
    'ENS name "unknown-name.eth" does not exist'
  );
});

test('tryConvertToEnsName', async () => {
  expect(await tryConvertToEnsName(mockedProvider, MOCKED_ENS_ENTRY.address)).toBe(MOCKED_ENS_ENTRY.ensName);

  const address = '0x2ec3E3e8a7E775E07b051E925C49Ed27862bf21d';
  expect(await tryConvertToEnsName(mockedProvider, address)).toBe(address);

  expect(await tryConvertToEnsName(mockedProvider, 'anything-but-address')).toBe('anything-but-address');
});
