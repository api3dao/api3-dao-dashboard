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

describe('abbrStr', () => {
  it('abbreviates the string with default start and end lengths', () => {
    const string = '0xfc83f22fb8167f9cdfb982dd4aeccc84d70df1494bca8271b3428d74df73807a';

    expect(abbrStr(string)).toBe('0xfc83f22...807a');
  });

  it('handles custom start and end lengths', () => {
    const string = '0xfc83f22fb8167f9cdfb982dd4aeccc84d70df1494bca8271b3428d74df73807a';

    expect(abbrStr(string, { startLength: 5 })).toBe('0xfc8...807a');
    expect(abbrStr(string, { endLength: 7 })).toBe('0xfc83f22...f73807a');
    expect(abbrStr(string, { startLength: 7, endLength: 7 })).toBe('0xfc83f...f73807a');
  });
});
