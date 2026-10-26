import { utils } from 'ethers';
import { isKnownMultiCallScript, KNOWN_MULTI_CALL_SCRIPT_HASHES } from './known-scripts';

const script = '0x00000001' + '11'.repeat(20) + '00000004deadbeef';
const hash = utils.keccak256(script);

afterEach(() => {
  KNOWN_MULTI_CALL_SCRIPT_HASHES.length = 0;
});

test('a script is known when its hash is listed', () => {
  expect(isKnownMultiCallScript(script)).toBe(false);

  KNOWN_MULTI_CALL_SCRIPT_HASHES.push(hash);
  expect(isKnownMultiCallScript(script)).toBe(true);
  expect(isKnownMultiCallScript(script.replace('deadbeef', 'deadbeee'))).toBe(false);
});
