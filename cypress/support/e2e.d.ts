/// <reference types="cypress" />

// https://docs.cypress.io/guides/tooling/typescript-support.html#Types-for-custom-commands
declare namespace Cypress {
  interface Chainable {
    increaseTimeAndRelogin(timeInSeconds: number): Chainable<void>;
    syncAppTimeWithChain(): Chainable<void>;
    login(): Chainable<void>;
    createChainSnapshot(name: string): Chainable<void>;
    useChainSnapshot(name: string): Chainable<void>;
    dataCy(value: string): Chainable<Element>;
    resetBlockchain(): Chainable<void>;
    switchAccount(index: number): Chainable<void>;
  }
}
