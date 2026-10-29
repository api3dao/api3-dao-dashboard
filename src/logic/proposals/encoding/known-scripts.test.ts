import { utils } from 'ethers';
import { isKnownMultiCallScript } from './known-scripts';

const script = '0x00000001' + '11'.repeat(20) + '00000004deadbeef';
const known = [utils.keccak256(script)];

test('a script is known when its hash is listed and the proposal is a primary one', () => {
  expect(isKnownMultiCallScript(script, 'primary', known)).toBe(true);
  expect(isKnownMultiCallScript(script, 'secondary', known)).toBe(false);
  expect(isKnownMultiCallScript(script.replace('deadbeef', 'deadbeee'), 'primary', known)).toBe(false);
  expect(isKnownMultiCallScript(script, 'primary', [])).toBe(false);
});

test('the list the dashboard ships is the default', () => {
  expect(isKnownMultiCallScript(script, 'primary')).toBe(false);
});
