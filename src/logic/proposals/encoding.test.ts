import { BigNumber } from '@ethersproject/bignumber';
import { updateImmutably } from '../../chain-data';
import {
  decodeEvmScript,
  decodeMetadata,
  decodeProposalTypeAndId,
  encodeEvmScript,
  encodeMetadata,
  encodeProposalTypeAndId,
  METADATA_DELIMETER,
} from './encoding';

const newFormData = {
  targetSignature: 'functionName(string,uint256)',
  description: 'My description',
  title: 'My title',
  parameters: JSON.stringify(['arg1', 123]),
  targetAddress: '0xB97F3A052d5562437e42EDeEBd1afec2376666eD',
  targetValue: '12',
  type: 'primary' as const,
};
const api3Agent = {
  primary: '0xd001cbCb278dDb424964e894a98d26bBdd4A8679',
  secondary: '0xb46863F7014D6F100F67Af778d660647f9Fc96ff',
};

describe('metadata', () => {
  test('encoding', () => {
    expect(encodeMetadata(newFormData)).toBe(
      // There is not a nice way to test it because METADATA_DELIMETER is non printable character
      ['1', 'functionName(string,uint256)', 'My title', 'My description'].join(METADATA_DELIMETER)
    );
  });

  test('decoding', () => {
    const encodedMetadata = encodeMetadata(newFormData);
    expect(decodeMetadata(encodedMetadata)).toEqual({
      description: 'My description',
      targetSignature: 'functionName(string,uint256)',
      title: 'My title',
      version: '1',
    });
  });
});

describe('EVM script', () => {
  test('correct encoding', () => {
    expect(encodeEvmScript(newFormData, api3Agent)).toBeDefined();
  });

  test('encoding incorrect params', () => {
    const invalidData = updateImmutably(newFormData, (data) => {
      data.parameters = JSON.stringify([123, 'arg1']);
    });
    expect(() => encodeEvmScript(invalidData, api3Agent)).toThrow();
  });

  test('decoding', () => {
    const encoded = encodeEvmScript(newFormData, api3Agent);
    const metadata = decodeMetadata(encodeMetadata(newFormData));

    expect(decodeEvmScript(encoded, metadata)).toEqual({
      targetAddress: '0xB97F3A052d5562437e42EDeEBd1afec2376666eD',
      value: 12,
      rawParameters: expect.anything(),
      parameters: ['arg1', '123'],
    });
  });
});

describe('proposal type and id', () => {
  test('encoding', () => {
    expect(encodeProposalTypeAndId('primary', '123')).toBe('primary-123');
  });

  test('decoding', () => {
    expect(decodeProposalTypeAndId('primary-123')).toEqual({ id: BigNumber.from(123), type: 'primary' });
  });

  test('decoding invalid value', () => {
    expect(decodeProposalTypeAndId('invalid-23notgood')).toBe(null);
    expect(decodeProposalTypeAndId('primary-1-5')).toBe(null);
    expect(decodeProposalTypeAndId('secondary-23notgood')).toBe(null);
    expect(decodeProposalTypeAndId('primary-23-randomjunk')).toBe(null);
  });
});
