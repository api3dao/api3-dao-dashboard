import { updateImmutably, abbrStr } from './helpers';

test('updateImmutably', () => {
  const value = { a: 123, b: 'hi' };
  const newValue = updateImmutably(value, (draft) => {
    draft.a = 789;
  });

  expect(value).toEqual({ a: 123, b: 'hi' });
  expect(newValue).toEqual({ a: 789, b: 'hi' });
});

test('abbrStr', () => {
  const string = '000000000000000000000000000000000000000000';

  expect(abbrStr(string)).toBe('000000000...0000');
});
