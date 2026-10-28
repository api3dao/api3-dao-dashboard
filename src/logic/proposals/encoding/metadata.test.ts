import { decodeMetadata, encodeMetadata, METADATA_DELIMETER, MULTI_CALL_METADATA_SCHEME_VERSION } from './metadata';

const newFormData = {
  targetSignature: 'functionName(string,uint256)',
  description: 'My description',
  title: 'My title',
  parameters: JSON.stringify(['arg1', 123]),
  targetAddress: '0xB97F3A052d5562437e42EDeEBd1afec2376666eD',
  targetValue: '12',
  type: 'primary' as const,
};

test('encoding', () => {
  expect(encodeMetadata(newFormData)).toBe(
    // There is not a nice way to test it because METADATA_DELIMETER is non printable character
    ['2', 'functionName(string,uint256)', 'My title', 'My description'].join(METADATA_DELIMETER)
  );
});

test('decoding', () => {
  const encodedMetadata = encodeMetadata(newFormData);
  expect(decodeMetadata(encodedMetadata)).toEqual({
    description: 'My description',
    targetSignature: 'functionName(string,uint256)',
    title: 'My title',
    version: '2',
  });
});

test('decoding invalid (separated by reserved delimiter)', () => {
  const invalidData = {
    ...newFormData,
    description: 'separated by reserved delimiter'.split(' ').join(METADATA_DELIMETER),
  };
  const metadata = decodeMetadata(encodeMetadata(invalidData));

  expect(metadata).toEqual(null);
});

describe('multi call metadata (version 3)', () => {
  test('decoding', () => {
    const encodedMetadata = [MULTI_CALL_METADATA_SCHEME_VERSION, 'My title', 'My description'].join(METADATA_DELIMETER);
    expect(decodeMetadata(encodedMetadata)).toEqual({
      version: '3',
      targetSignature: null,
      title: 'My title',
      description: 'My description',
    });
  });

  test('decoding invalid (carries a target signature)', () => {
    const encodedMetadata = [
      MULTI_CALL_METADATA_SCHEME_VERSION,
      'transfer(address,uint256)',
      'My title',
      'My description',
    ].join(METADATA_DELIMETER);
    expect(decodeMetadata(encodedMetadata)).toEqual(null);
  });

  test('the dashboard keeps creating version 2 proposals', () => {
    expect(encodeMetadata(newFormData).split(METADATA_DELIMETER)[0]).toBe('2');
  });
});
