import { getDays, getHours, getMinutes, getSeconds, go, goSync, removeKey } from './generic';

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
  const twelveDays = 1000 * 60 * 60 * 24 * 12;
  expect(getDays(twelveDays)).toBe('12');

  const fiveDays = 1000 * 60 * 60 * 24 * 5.672839;
  expect(getDays(fiveDays)).toBe('05');
});

test('getHours', () => {
  const sixHours = 1000 * 60 * 60 * 6;
  expect(getHours(sixHours)).toBe('06');

  const fiveHours = 1000 * 60 * 60 * 5.672839;
  expect(getHours(fiveHours)).toBe('05');
});

test('getMinutes', () => {
  const twentyMinutes = 1000 * 60 * 20;
  expect(getMinutes(twentyMinutes)).toBe('20');

  const thirtyThreeMinutes = 1000 * 60 * 33.2158593;
  expect(getMinutes(thirtyThreeMinutes)).toBe('33');
});

test('getSeconds', () => {
  const fortySeconds = 1000 * 40;
  expect(getSeconds(fortySeconds)).toBe('40');

  const twentySeconds = 1000 * 20.98472;
  expect(getSeconds(twentySeconds)).toBe('20');
});
