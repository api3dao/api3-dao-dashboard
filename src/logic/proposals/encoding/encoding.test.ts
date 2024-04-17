import { assertGoError, assertGoSuccess } from '@api3/promise-utils';
import { constants, providers, BigNumber } from 'ethers';
import { EncodedEvmScriptError } from '.';
import { updateImmutably } from '../../../chain-data';
import {
  decodeEvmScript,
  goEncodeEvmScript,
  isEvmScriptValid,
  encodeFunctionSignature,
  stringifyBigNumbersRecursively,
} from './encoding';
import { decodeMetadata, encodeMetadata } from './metadata';

const newFormData = {
  targetSignature: 'functionName(string,uint256)',
  description: 'My description',
  title: 'My title',
  parameters: JSON.stringify(['arg1', 123]),
  targetAddress: '0xB97F3A052d5562437e42EDeEBd1afec2376666eD',
  targetValue: '12',
  type: 'primary' as const,
  version: '2',
};
const api3Agent = {
  primary: '0xd9f80bdb37e6bad114d747e60ce6d2aaf26704ae',
  secondary: '0x556ecbb0311d350491ba0ec7e019c354d7723ce0',
};

const MOCKED_ENS_ENTRY = { ensName: 'api3-mocked.eth', address: '0xe97D5D255Dc4458477f7E435c3aF0d8bd07231eA' };
const mockedProvider: providers.JsonRpcProvider = {
  resolveName: (name: string) => {
    return Promise.resolve(name === MOCKED_ENS_ENTRY.ensName ? MOCKED_ENS_ENTRY.address : null);
  },
  lookupAddress: (address: string) => {
    return Promise.resolve(address === MOCKED_ENS_ENTRY.address ? MOCKED_ENS_ENTRY.ensName : null);
  },
} as any;

test('correct contract call proposal', async () => {
  const goRes = await goEncodeEvmScript(mockedProvider, newFormData, api3Agent);

  assertGoSuccess(goRes);
  expect(goRes.data).toBeDefined();
});

test('simple ETH transfers using zero length parameters and empty target signature', async () => {
  const validData = updateImmutably(newFormData, (data) => {
    data.parameters = '[]';
    data.targetSignature = '';
  });

  const goRes = await goEncodeEvmScript(mockedProvider, validData, api3Agent);

  assertGoSuccess(goRes);
  expect(goRes.data).toBeDefined();
});

describe('encoding incorrect parameters', () => {
  test('incorrect parameter values', async () => {
    const invalidData = updateImmutably(newFormData, (data) => {
      data.parameters = JSON.stringify([123, 'arg1']); // they are in the wrong order
    });

    const goRes = await goEncodeEvmScript(mockedProvider, invalidData, api3Agent);

    assertGoError(goRes);
    expect(goRes.error).toEqual(
      new EncodedEvmScriptError('parameters', 'Ensure parameters match target contract signature')
    );
  });

  test('wrong shape', async () => {
    const invalidData = updateImmutably(newFormData, (data) => {
      data.parameters = JSON.stringify({ param: 'value' });
    });

    const goRes = await goEncodeEvmScript(mockedProvider, invalidData, api3Agent);

    assertGoError(goRes);
    expect(goRes.error).toEqual(new EncodedEvmScriptError('parameters', 'Make sure parameters is a valid JSON array'));
  });

  test('wrong number of parameters', async () => {
    const invalidData = updateImmutably(newFormData, (data) => {
      data.parameters = JSON.stringify(['arg1']);
    });

    const goRes = await goEncodeEvmScript(mockedProvider, invalidData, api3Agent);

    assertGoError(goRes);
    expect(goRes.error).toEqual(
      new EncodedEvmScriptError('parameters', 'Please specify the correct number of function arguments')
    );
  });

  test('zero length parameters with non-empty target signature', async () => {
    const invalidData = updateImmutably(newFormData, (data) => {
      data.parameters = '[]';
    });

    const goRes = await goEncodeEvmScript(mockedProvider, invalidData, api3Agent);

    assertGoError(goRes);
    expect(goRes.error).toEqual(
      new EncodedEvmScriptError('parameters', 'Please specify the correct number of function arguments')
    );
  });

  test('empty parameters with non-empty target signature', async () => {
    const invalidData = updateImmutably(newFormData, (data) => {
      data.parameters = '';
    });

    const goRes = await goEncodeEvmScript(mockedProvider, invalidData, api3Agent);

    assertGoError(goRes);
    expect(goRes.error).toEqual(new EncodedEvmScriptError('parameters', 'Make sure parameters is a valid JSON array'));
  });

  it('throws when address is not a string', async () => {
    const invalidData = updateImmutably(newFormData, (data) => {
      data.targetSignature = 'functionName(address)';
      data.parameters = JSON.stringify([123]);
    });

    const goRes = await goEncodeEvmScript(mockedProvider, invalidData, api3Agent);

    assertGoError(goRes);
    expect(goRes.error).toEqual(
      new EncodedEvmScriptError('parameters', 'Ensure parameters match target contract signature')
    );
  });
});

test('zero value for simple ETH transfer', async () => {
  const invalidData = updateImmutably(newFormData, (data) => {
    data.parameters = '[]';
    data.targetSignature = '';
    data.targetValue = '0';
  });

  const goRes = await goEncodeEvmScript(mockedProvider, invalidData, api3Agent);

  assertGoError(goRes);
  expect(goRes.error).toEqual(
    new EncodedEvmScriptError('targetValue', 'Value must be greater than 0 for ETH transfers')
  );
});

describe('encoding invalid target signature', () => {
  it('detects parameter type typo', async () => {
    const invalidData = updateImmutably(newFormData, (data) => {
      data.targetSignature = 'functionName(string,unit256)';
    });

    const goRes = await goEncodeEvmScript(mockedProvider, invalidData, api3Agent);

    assertGoError(goRes);
    expect(goRes.error).toEqual(
      new EncodedEvmScriptError('parameters', 'Ensure parameters match target contract signature')
    );
  });

  it('detects when the function is unnecessarily quoted', async () => {
    const invalidData = updateImmutably(newFormData, (data) => {
      data.targetSignature = '"functionName(string,unit256)"';
    });

    const goRes = await goEncodeEvmScript(mockedProvider, invalidData, api3Agent);

    assertGoError(goRes);
    expect(goRes.error).toEqual(
      new EncodedEvmScriptError('targetSignature', 'Please specify a valid contract signature')
    );
  });

  it('has empty target signature but non-empty parameters', async () => {
    const invalidData = updateImmutably(newFormData, (data) => {
      data.targetSignature = '';
    });

    const goRes = await goEncodeEvmScript(mockedProvider, invalidData, api3Agent);

    assertGoError(goRes);
    expect(goRes.error).toEqual(
      new EncodedEvmScriptError('parameters', 'Please specify the correct number of function arguments')
    );
  });
});

describe('address validation', () => {
  it('checks for valid account address', async () => {
    const invalidData = updateImmutably(newFormData, (data) => {
      data.targetAddress = 'surely-not-an-address';
    });

    const goRes = await goEncodeEvmScript(mockedProvider, invalidData, api3Agent);

    assertGoError(goRes);
    expect(goRes.error).toEqual(new EncodedEvmScriptError('targetAddress', 'Please specify a valid account address'));
  });

  test('empty address', async () => {
    const invalidData = updateImmutably(newFormData, (data) => {
      data.targetAddress = '';
    });

    const goRes = await goEncodeEvmScript(mockedProvider, invalidData, api3Agent);

    assertGoError(goRes);
    expect(goRes.error).toEqual(new EncodedEvmScriptError('targetAddress', 'Please specify a valid account address'));
  });

  test('zero address', async () => {
    const invalidData = updateImmutably(newFormData, (data) => {
      data.targetAddress = constants.AddressZero;
    });

    const goRes = await goEncodeEvmScript(mockedProvider, invalidData, api3Agent);

    assertGoSuccess(goRes);
  });
});

it('checks for positive ETH amount', async () => {
  const invalidData = updateImmutably(newFormData, (data) => {
    data.targetValue = '-0.12345';
  });

  const goRes = await goEncodeEvmScript(mockedProvider, invalidData, api3Agent);

  assertGoError(goRes);
  expect(goRes.error).toEqual(new EncodedEvmScriptError('targetValue', 'Please enter a valid amount in Wei'));
});

test('decoding', async () => {
  const goRes = await goEncodeEvmScript(mockedProvider, newFormData, api3Agent);
  const metadata = decodeMetadata(encodeMetadata(newFormData))!;

  assertGoSuccess(goRes);
  expect(await decodeEvmScript(mockedProvider, goRes.data, metadata)).toEqual({
    targetAddress: '0xB97F3A052d5562437e42EDeEBd1afec2376666eD',
    value: BigNumber.from('12'),
    parameters: ['arg1', '123'],
  });
});

describe('ENS name support', () => {
  it('supports ENS name in target address', async () => {
    const formDataWithAddress = updateImmutably(newFormData, (data) => {
      data.targetAddress = MOCKED_ENS_ENTRY.ensName;
    });

    const goRes = await goEncodeEvmScript(mockedProvider, formDataWithAddress, api3Agent);
    const metadata = decodeMetadata(encodeMetadata(formDataWithAddress))!;

    assertGoSuccess(goRes);
    expect(await decodeEvmScript(mockedProvider, goRes.data, metadata)).toEqual({
      targetAddress: MOCKED_ENS_ENTRY.address,
      value: BigNumber.from('12'),
      parameters: ['arg1', '123'],
    });
  });

  it('supports ENS names in parameters', async () => {
    const formDataWithAddress = updateImmutably(newFormData, (data) => {
      data.targetSignature = 'functionName(address)';
      data.parameters = JSON.stringify([MOCKED_ENS_ENTRY.ensName]);
    });

    const goRes = await goEncodeEvmScript(mockedProvider, formDataWithAddress, api3Agent);
    const metadata = decodeMetadata(encodeMetadata(formDataWithAddress))!;

    assertGoSuccess(goRes);
    expect(await decodeEvmScript(mockedProvider, goRes.data, metadata)).toEqual({
      targetAddress: '0xB97F3A052d5562437e42EDeEBd1afec2376666eD',
      value: BigNumber.from('12'),
      parameters: [MOCKED_ENS_ENTRY.address],
    });
  });

  it('supports addresses in parameters', async () => {
    const address = '0x4017F39E438ADA9F860E15030E6A6e4b7b1af8Ba';
    const formDataWithAddress = updateImmutably(newFormData, (data) => {
      data.targetSignature = 'functionName(address)';
      data.parameters = JSON.stringify([address]);
    });

    const goRes = await goEncodeEvmScript(mockedProvider, formDataWithAddress, api3Agent);
    assertGoSuccess(goRes);
    const metadata = decodeMetadata(encodeMetadata(formDataWithAddress))!;

    expect(await decodeEvmScript(mockedProvider, goRes.data, metadata)).toEqual({
      targetAddress: '0xB97F3A052d5562437e42EDeEBd1afec2376666eD',
      value: BigNumber.from('12'),
      parameters: [address],
    });
  });

  it('encoding fails if non existent ENS name is passed in parameters', async () => {
    const formDataWithAddress = updateImmutably(newFormData, (data) => {
      data.targetSignature = 'functionName(address)';
      data.parameters = JSON.stringify(['non-existent.eth']);
    });

    const goRes = await goEncodeEvmScript(mockedProvider, formDataWithAddress, api3Agent);
    assertGoError(goRes);
    expect(goRes.error).toEqual(
      new EncodedEvmScriptError('parameters', 'Ensure parameters match target contract signature')
    );
  });
});

test('encodeFunctionSignature', () => {
  expect(encodeFunctionSignature('sendMessage(string,address)')).toBe('0xc48d6d5e');
  expect(encodeFunctionSignature('execute(address,uint256,bytes)')).toBe('0xb61d27f6');
});

describe('stringifyBigNumbersRecursively', () => {
  it('does not support objects', () => {
    const value = {
      bigNumArray: [BigNumber.from('123'), BigNumber.from('456')],
      str: 'str',
    };

    expect(stringifyBigNumbersRecursively(value)).toEqual(value);
  });

  it('works for values and arrays', () => {
    expect(stringifyBigNumbersRecursively([BigNumber.from('123'), BigNumber.from('456'), 'str'])).toEqual([
      '123',
      '456',
      'str',
    ]);
    expect(stringifyBigNumbersRecursively(BigNumber.from('123'))).toEqual('123');
  });
});

const versions = ['1', '2'];

describe('isEvmScriptValid()', () => {
  it('returns true if the EVM script matches the original proposal data', async () => {
    // All encoding versions should generate the same script
    const script =
      '0x00000001556ecbb0311d350491ba0ec7e019c354d7723ce0000000e4b61d27f6000000000000000000000000a0b86991c6218b36c1d19d4a2e9eb0ce3606eb48000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000600000000000000000000000000000000000000000000000000000000000000044a9059cbb000000000000000000000000cb943e4fb0bcf7ec3c2e6d263c275b27f07701c600000000000000000000000000000000000000000000000000000019edcabff000000000000000000000000000000000000000000000000000000000';

    for (const version of versions) {
      const metadata = {
        description: 'https://ipfs.fleek.co/ipfs/bafybeicfguu3bfhk3fyz5zn5wlujpksqxsaokse37674fhylouvsqnwd2m',
        targetSignature: 'transfer(address,uint256)',
        title: 'API3 DAO BD-API Team Proposal',
        version,
      };
      const decodedEvmScript = await decodeEvmScript(mockedProvider, script, metadata);
      expect(decodedEvmScript).not.toBeNull();
      expect(decodedEvmScript!.targetAddress).toEqual('0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48');
      expect(decodedEvmScript!.value.toString()).toEqual('0');
      expect(decodedEvmScript!.parameters).toEqual(['0xCB943E4Fb0bCf7eC3C2E6D263c275b27F07701c6', '111363670000']);

      const result = await isEvmScriptValid(mockedProvider, api3Agent, {
        type: 'secondary',
        metadata,
        decodedEvmScript,
        script,
      });

      expect(result).toBe(true);
    }
  });

  it('returns false if the EVM script does not match the original proposal data', async () => {
    // All encoding versions should generate the same script
    const script =
      '0x00000001556ecbb0311d350491ba0ec7e019c354d7723ce0000000e4b61d27f6000000000000000000000000a0b86991c6218b36c1d19d4a2e9eb0ce3606eb48000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000600000000000000000000000000000000000000000000000000000000000000044a9059cbb000000000000000000000000cb943e4fb0bcf7ec3c2e6d263c275b27f07701c600000000000000000000000000000000000000000000000000000019edcabff000000000000000000000000000000000000000000000000000000000';

    for (const version of versions) {
      /*
        Original EVM script: transfer(address,uint256)
        Decoded EVM script: transfer(address,int32)
      */
      const metadata = {
        description: 'https://ipfs.fleek.co/ipfs/bafybeicfguu3bfhk3fyz5zn5wlujpksqxsaokse37674fhylouvsqnwd2m',
        targetSignature: 'transfer(address,int32)',
        title: 'API3 DAO BD-API Team Proposal',
        version,
      };
      const decodedEvmScript = await decodeEvmScript(mockedProvider, script, metadata);
      expect(decodedEvmScript).not.toBeNull();
      expect(decodedEvmScript!.targetAddress).toEqual('0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48');
      expect(decodedEvmScript!.value.toString()).toEqual('0');
      expect(decodedEvmScript!.parameters).toEqual(['0xCB943E4Fb0bCf7eC3C2E6D263c275b27F07701c6', -305479696]);

      const result = await isEvmScriptValid(mockedProvider, api3Agent, {
        type: 'secondary',
        metadata,
        decodedEvmScript,
        script,
      });

      expect(result).toBe(false);
    }
  });

  it('returns false if the decoded EVM script is null', async () => {
    // All encoding versions should generate the same script
    const script =
      '0x00000001556ecbb0311d350491ba0ec7e019c354d7723ce0000000e4b61d27f6000000000000000000000000a0b86991c6218b36c1d19d4a2e9eb0ce3606eb48000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000600000000000000000000000000000000000000000000000000000000000000044a9059cbb000000000000000000000000cb943e4fb0bcf7ec3c2e6d263c275b27f07701c600000000000000000000000000000000000000000000000000000019edcabff000000000000000000000000000000000000000000000000000000000';

    for (const version of versions) {
      const metadata = {
        description: 'https://ipfs.fleek.co/ipfs/bafybeicfguu3bfhk3fyz5zn5wlujpksqxsaokse37674fhylouvsqnwd2m',
        targetSignature: 'transfer(address,uint256)',
        title: 'API3 DAO BD-API Team Proposal',
        version,
      };

      const result = await isEvmScriptValid(mockedProvider, api3Agent, {
        type: 'secondary',
        metadata,
        decodedEvmScript: null,
        script,
      });

      expect(result).toBe(false);
    }
  });

  describe('when the proposal has a non-zero Wei value', () => {
    it('returns true if the EVM script matches the original proposal data', async () => {
      // All encoding versions should generate the same script
      const script =
        '0x00000001bb4c8c398288f2309b32dd83bc7dd3e4f93c605f000000e4b61d27f6000000000000000000000000a0b86991c6218b36c1d19d4a2e9eb0ce3606eb480000000000000000000000000000000000000000000000008ac7230489e8000000000000000000000000000000000000000000000000000000000000000000600000000000000000000000000000000000000000000000000000000000000044a9059cbb000000000000000000000000cb943e4fb0bcf7ec3c2e6d263c275b27f07701c600000000000000000000000000000000000000000000000000000019edcabff000000000000000000000000000000000000000000000000000000000';

      for (const version of versions) {
        const metadata = {
          description: 'https://ipfs.fleek.co/ipfs/bafybeicfguu3bfhk3fyz5zn5wlujpksqxsaokse37674fhylouvsqnwd2m',
          targetSignature: 'transfer(address,uint256)',
          title: 'API3 DAO BD-API Team Proposal',
          version,
        };
        const decodedEvmScript = await decodeEvmScript(mockedProvider, script, metadata);
        expect(decodedEvmScript).not.toBeNull();
        expect(decodedEvmScript!.targetAddress).toEqual('0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48');
        expect(decodedEvmScript!.value.toString()).toEqual('10000000000000000000');
        expect(decodedEvmScript!.parameters).toEqual(['0xCB943E4Fb0bCf7eC3C2E6D263c275b27F07701c6', '111363670000']);

        const result = await isEvmScriptValid(
          mockedProvider,
          { ...api3Agent, primary: '0xbb4c8c398288f2309b32dd83bc7dd3e4f93c605f' },
          {
            type: 'primary',
            metadata,
            decodedEvmScript,
            script,
          }
        );

        expect(result).toBe(true);
      }
    });

    it('returns false if the EVM script does not match the original proposal data', async () => {
      // All encoding versions should generate the same script
      const script =
        '0x00000001bb4c8c398288f2309b32dd83bc7dd3e4f93c605f000000e4b61d27f6000000000000000000000000a0b86991c6218b36c1d19d4a2e9eb0ce3606eb480000000000000000000000000000000000000000000000008ac7230489e8000000000000000000000000000000000000000000000000000000000000000000600000000000000000000000000000000000000000000000000000000000000044a9059cbb000000000000000000000000cb943e4fb0bcf7ec3c2e6d263c275b27f07701c600000000000000000000000000000000000000000000000000000019edcabff000000000000000000000000000000000000000000000000000000000';

      for (const version of versions) {
        /*
          Original EVM script: transfer(address,uint256)
          Decoded EVM script: transfer(address,int32)
        */
        const metadata = {
          description: 'https://ipfs.fleek.co/ipfs/bafybeicfguu3bfhk3fyz5zn5wlujpksqxsaokse37674fhylouvsqnwd2m',
          targetSignature: 'transfer(address,int32)',
          title: 'API3 DAO BD-API Team Proposal',
          version,
        };
        const decodedEvmScript = await decodeEvmScript(mockedProvider, script, metadata);
        expect(decodedEvmScript).not.toBeNull();
        expect(decodedEvmScript!.targetAddress).toEqual('0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48');
        expect(decodedEvmScript!.value.toString()).toEqual('10000000000000000000');
        expect(decodedEvmScript!.parameters).toEqual(['0xCB943E4Fb0bCf7eC3C2E6D263c275b27F07701c6', -305479696]);

        const result = await isEvmScriptValid(
          mockedProvider,
          { ...api3Agent, primary: '0xbb4c8c398288f2309b32dd83bc7dd3e4f93c605f' },
          {
            type: 'primary',
            metadata,
            decodedEvmScript,
            script,
          }
        );

        expect(result).toBe(false);
      }
    });
  });

  describe('when the proposal is a simple ETH transfer', () => {
    it('returns true if the EVM script matches the original proposal data (version 1)', async () => {
      // Version 1 encodes the target signature and params even though the target signature is blank
      const script =
        '0x00000001e0786c9956480b64808494676911f0afe39f8baa000000a4b61d27f60000000000000000000000001ddfc105fb187131ab6d77eecb966f87a2efa6640000000000000000000000000000000000000000000000000de0b6b3a764000000000000000000000000000000000000000000000000000000000000000000600000000000000000000000000000000000000000000000000000000000000004c5d2460100000000000000000000000000000000000000000000000000000000';
      const metadata = {
        description: 'Send ETH to an EOA',
        targetSignature: '',
        title: 'Make a simple ETH transfer proposal',
        version: '1',
      };
      const decodedEvmScript = await decodeEvmScript(mockedProvider, script, metadata);
      expect(decodedEvmScript).not.toBeNull();
      expect(decodedEvmScript!.targetAddress).toEqual('0x1dDFC105fB187131Ab6D77EECb966F87a2efA664');
      expect(decodedEvmScript!.value.toString()).toEqual('1000000000000000000');
      expect(decodedEvmScript!.parameters).toEqual([]);

      const result = await isEvmScriptValid(
        mockedProvider,
        {
          primary: '0xbb4c8c398288f2309b32dd83bc7dd3e4f93c605f',
          secondary: '0xe0786c9956480b64808494676911f0afe39f8baa',
        },
        {
          type: 'secondary',
          metadata,
          decodedEvmScript,
          script,
        }
      );

      expect(result).toBe(true);
    });

    it('returns true if the EVM script matches the original proposal data (version 2)', async () => {
      // Version 2 no longer encodes the target signature and params when the target signature is blank
      const script =
        '0x0000000188ad285a3abbf15d83c86115755e338a73f31c7600000084b61d27f60000000000000000000000001423e3ef0b488144f946f1c6c1efab0fed1f43840000000000000000000000000000000000000000000000000de0b6b3a764000000000000000000000000000000000000000000000000000000000000000000600000000000000000000000000000000000000000000000000000000000000000';
      const metadata = {
        description: 'Send ETH to an EOA',
        targetSignature: '',
        title: 'Make a simple ETH transfer proposal',
        version: '2',
      };
      const decodedEvmScript = await decodeEvmScript(mockedProvider, script, metadata);
      expect(decodedEvmScript).not.toBeNull();
      expect(decodedEvmScript!.targetAddress).toEqual('0x1423e3EF0B488144f946F1c6C1eFaB0FED1f4384');
      expect(decodedEvmScript!.value.toString()).toEqual('1000000000000000000');
      expect(decodedEvmScript!.parameters).toEqual([]);

      const result = await isEvmScriptValid(
        mockedProvider,
        {
          primary: '0x9b10b5b0115288f7ea119a9b4515fcf394efe7cc',
          secondary: '0x88ad285a3abbf15d83c86115755e338a73f31c76',
        },
        {
          type: 'secondary',
          metadata,
          decodedEvmScript,
          script,
        }
      );

      expect(result).toBe(true);
    });
  });
});
