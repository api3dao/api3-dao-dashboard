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
  const string = 'dffd4543xggdfgdter5452442zsdfs31214';

  expect(abbrStr(string)).toBe('dffd4...1214');
});
