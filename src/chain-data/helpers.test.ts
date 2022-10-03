import { produceState, abbrStr } from './helpers';

describe('produceState', () => {
  it('creates a new state object from the mutated draft object', () => {
    const state = { a: 123, b: 'hi' };
    const newState = produceState(state, (draft) => {
      draft.a = 789;
    });

    expect(state).toEqual({ a: 123, b: 'hi' });
    expect(newState).toEqual({ a: 789, b: 'hi' });
  });

  it('creates a curried function', () => {
    interface State {
      a: number;
      b: string[];
    }
    type CurriedFn = (state: State) => State;
    const curried: CurriedFn = produceState((draft) => {
      draft.b[0] = 'hi';
    });

    const state = { a: 42, b: ['hello', 'world'] };
    const newState = curried(state);

    expect(state).toEqual({ a: 42, b: ['hello', 'world'] });
    expect(newState).toEqual({ a: 42, b: ['hi', 'world'] });
  });
});

test('abbrStr', () => {
  const string = 'dffd4543xggdfgdter5452442zsdfs31214';

  expect(abbrStr(string)).toBe('dffd4543x...1214');
});
