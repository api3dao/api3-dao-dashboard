import produce from 'immer';

export const updateImmutably = <T>(state: T, updateCb: (immutableState: T) => void) =>
  // NOTE: This needs to be written in a function like this, to make sure `produce` doesn't return anything.
  // See: https://immerjs.github.io/immer/return/
  produce(state, (draft) => {
    updateCb(draft as T);
  });
