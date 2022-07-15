/// <reference types="cypress" />

// https://docs.cypress.io/guides/tooling/typescript-support.html#Types-for-custom-commands
declare namespace Cypress {
  interface Chainable {
    increaseTimeAndRelogin(timeInSeconds: number): Chainable<void>;
    login(): Chainable<void>;
    createChainSnapshot(name: string): Chainable<void>;
    useChainSnapshot(name: string): Chainable<void>;
    dataCy(value: string): Chainable<Element>;
    resetBlockchain(): Chainable<void>;
    resetClock(): Chainable<void>;
    switchAccount(index: number): Chainable<void>;
  }
}
