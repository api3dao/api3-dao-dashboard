/// <reference path="../support/index.d.ts" />

import { EPOCH_LENGTH } from '../support/common';

describe('staking', () => {
  before('login, deposit and stake', () => {
    cy.resetBlockchain().login();

    // Approve and deposit
    cy.findByText('+ Deposit').click();
    cy.get('#modal').find('input').type('500');
    cy.findByText('Approve').click();
    cy.findByText('Deposit').click();
    cy.dataCy('balance').should('have.text', '500.0');

    // Stake
    cy.findByText('+ Stake').click();
    cy.get('#modal').find('input').type('100');
    cy.findByText('Stake').click();
    cy.dataCy('unstaked').should('have.text', '400.0');
    cy.dataCy('withdrawable').should('have.text', '400.0');
    cy.dataCy('staked').should('have.text', '100.0');

    // Create a snapshot of blockchain
    cy.createChainSnapshot('user-staked');
  });

  it('can deposit and stake', () => {
    cy.useChainSnapshot('user-staked');

    cy.findByText('+ Deposit').click();
    cy.get('#modal').find('input').type('200');
    cy.findByText('Deposit and Stake').click();

    // Assert balances
    cy.dataCy('balance').should('have.text', '700.0');
    cy.dataCy('staked').should('have.text', '300.0');
  });

  it('user can unstake', () => {
    cy.useChainSnapshot('user-staked');

    // Schedule unstake
    cy.findByText('Initiate Unstake').click();
    cy.get('#modal').find('input').type('20');
    cy.findByText('Initiate Unstaking').click();
    cy.findByText('Initiate Unstaking').click(); // confirm the unstake in the second modal
    cy.findByText('Pending API3 tokens unstaking').should('exist');
    // Assert balances
    cy.dataCy('balance').should('have.text', '480.0');
    cy.dataCy('staked').should('have.text', '80.0');
    cy.dataCy('amount').should('have.text', '20.0');

    // Travel to the future and unstake
    cy.increaseTimeAndRelogin(EPOCH_LENGTH + 60 * 60); // add 1 hour to be sure unstake time passed
    cy.findAllByText('Unstake').should('have.length', 2);
    cy.findAllByText('Unstake').first().click();

    // Restore the original clock
    cy.resetClock();

    cy.dataCy('pending-unstake').should('not.exist');
    // Assert balances
    cy.dataCy('balance').should('have.text', '500.74'); // 0.74 because of the minted reward
    cy.dataCy('staked').should('have.text', '80.74');
    cy.dataCy('unstaked').should('have.text', '420.0');
    cy.dataCy('withdrawable').should('have.text', '420.0');
  });

  it('user can withdraw', () => {
    cy.useChainSnapshot('user-staked');

    cy.findByText('Withdraw').click();
    cy.get('#modal').find('input').type('50');
    cy.get('#modal').findByText('Withdraw').click();
    cy.dataCy('withdrawable').should('have.text', '350.0');
    cy.dataCy('unstaked').should('have.text', '350.0');
  });
});

it('user can unstake & withdraw', () => {
  cy.resetBlockchain().login();

  // Approve and deposit
  cy.findByText('+ Deposit').click();
  cy.get('#modal').find('input').type('1000');
  cy.findByText('Approve').click();
  cy.findByText('Deposit and Stake').click();
  cy.dataCy('balance').should('have.text', '1,000.0');

  // Schedule unstake
  cy.findByText('Initiate Unstake').click();
  cy.get('#modal').find('input').type('550');
  cy.findByText('Initiate Unstaking').click();
  cy.findByText('Initiate Unstaking').click(); // confirm the unstake in the second modal
  cy.findByText('Pending API3 tokens unstaking').should('exist');
  // Assert balances
  cy.dataCy('balance').should('have.text', '450.0');
  cy.dataCy('staked').should('have.text', '450.0');
  cy.dataCy('amount').should('have.text', '550.0');

  // Travel to the future and unstake
  cy.increaseTimeAndRelogin(EPOCH_LENGTH + 60 * 60); // add 1 hour to be sure unstake time passed
  cy.findAllByText('Unstake and Withdraw').first().click();
  // Restore the original clock
  cy.resetClock();

  // The unstaked amount is now fully in users wallet.
  // Only the staked amount is left in the pool
  cy.dataCy('balance').should('have.text', '450.0');
  cy.dataCy('staked').should('have.text', '450.0');
});
