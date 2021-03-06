import { assertGoError, assertGoSuccess } from '@api3/promise-utils';
import { constants, utils, providers, BigNumber } from 'ethers';
import { EncodedEvmScriptError } from '.';
import { updateImmutably } from '../../../chain-data';
import {
  decodeEvmScript,
  goEncodeEvmScript,
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
};
const api3Agent = {
  primary: '0xd001cbCb278dDb424964e894a98d26bBdd4A8679',
  secondary: '0xb46863F7014D6F100F67Af778d660647f9Fc96ff',
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

test('correct encoding', async () => {
  const goRes = await goEncodeEvmScript(mockedProvider, newFormData, api3Agent);

  assertGoSuccess(goRes);
  expect(goRes.data).toBeDefined();
});

describe('encoding incorrect params', () => {
  it('incorrect parameter values', async () => {
    const invalidData = updateImmutably(newFormData, (data) => {
      data.parameters = JSON.stringify([123, 'arg1']); // they are in the wrong order
    });

    const goRes = await goEncodeEvmScript(mockedProvider, invalidData, api3Agent);

    assertGoError(goRes);
    expect(goRes.error).toEqual(
      new EncodedEvmScriptError('parameters', 'Ensure parameters match target contract signature')
    );
  });

  it('wrong shape', async () => {
    const invalidData = updateImmutably(newFormData, (data) => {
      data.parameters = JSON.stringify({ param: 'value' });
    });

    const goRes = await goEncodeEvmScript(mockedProvider, invalidData, api3Agent);

    assertGoError(goRes);
    expect(goRes.error).toEqual(new EncodedEvmScriptError('parameters', 'Make sure parameters is a valid JSON array'));
  });

  it('empty parameters', async () => {
    const invalidData = updateImmutably(newFormData, (data) => {
      data.parameters = '';
    });

    const goRes = await goEncodeEvmScript(mockedProvider, invalidData, api3Agent);

    assertGoError(goRes);
    expect(goRes.error).toEqual(new EncodedEvmScriptError('parameters', 'Make sure parameters is a valid JSON array'));
  });

  it('wrong number of parameters', async () => {
    const invalidData = updateImmutably(newFormData, (data) => {
      data.parameters = JSON.stringify(['arg1']);
    });

    const goRes = await goEncodeEvmScript(mockedProvider, invalidData, api3Agent);

    assertGoError(goRes);
    expect(goRes.error).toEqual(
      new EncodedEvmScriptError('parameters', 'Please specify the correct number of function arguments')
    );
  });
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

  it('empty address', async () => {
    const invalidData = updateImmutably(newFormData, (data) => {
      data.targetAddress = '';
    });

    const goRes = await goEncodeEvmScript(mockedProvider, invalidData, api3Agent);

    assertGoError(goRes);
    expect(goRes.error).toEqual(new EncodedEvmScriptError('targetAddress', 'Please specify a valid account address'));
  });

  it('zero address is fine', async () => {
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
  expect(goRes.error).toEqual(new EncodedEvmScriptError('targetValue', 'Please enter valid non-negative ETH amount'));
});

test('decoding', async () => {
  const goRes = await goEncodeEvmScript(mockedProvider, newFormData, api3Agent);
  const metadata = decodeMetadata(encodeMetadata(newFormData))!;

  assertGoSuccess(goRes);
  expect(await decodeEvmScript(mockedProvider, goRes.data, metadata)).toEqual({
    targetAddress: '0xB97F3A052d5562437e42EDeEBd1afec2376666eD',
    value: utils.parseEther('12'),
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
      targetAddress: MOCKED_ENS_ENTRY.ensName,
      value: utils.parseEther('12'),
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
      value: utils.parseEther('12'),
      parameters: [MOCKED_ENS_ENTRY.ensName],
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
      value: utils.parseEther('12'),
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
