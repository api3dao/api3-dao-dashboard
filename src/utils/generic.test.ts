import { getDays, getHours, getMinutes, getSeconds, go, goSync } from './generic';

describe('goSync', () => {
  it('resolves successful synchronous functions', () => {
    const res = goSync(() => 2 + 2);
    expect(res).toEqual([null, 4]);
  });

  it('resolves unsuccessful synchronous functions', () => {
    const err = new Error('Computer says no');
    const res = goSync(() => {
      throw err;
    });
    expect(res).toEqual([err, null]);
  });
});

describe('go', () => {
  it('resolves successful asynchronous functions', async () => {
    const successFn = new Promise((res) => res(2));
    const res = await go(successFn);
    expect(res).toEqual([null, 2]);
  });

  it('resolves unsuccessful asynchronous functions', async () => {
    const err = new Error('Computer says no');
    const errorFn = new Promise((_res, rej) => rej(err));
    const res = await go(errorFn);
    expect(res).toEqual([err, null]);
  });
});

test('getDays', () => {
  expect(getDays(1_234_000_000)).toBe('14');
  expect(getDays(11_000_000_000)).toBe('127');
});

test('getHours', () => {
  expect(getHours(1_234_000_000)).toBe('6');
  expect(getHours(11_000_000_000)).toBe('7');
});

test('getMinutes', () => {
  expect(getMinutes(1_234_000_000)).toBe('46');
  expect(getMinutes(11_000_000_000)).toBe('33');
});

test('getSeconds', () => {
  expect(getSeconds(1_234_000_000)).toBe('40');
  expect(getSeconds(11_000_000_000)).toBe('20');
});
