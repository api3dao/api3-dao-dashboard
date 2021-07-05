/// <reference path="../support/index.d.ts" />

import { ACCOUNTS, EPOCH_LENGTH } from '../support/common';

it('new proposal form validation', () => {
  cy.increaseTimeAndRelogin(EPOCH_LENGTH + 60 * 60); // skip the genesis epoch (add 1 hour just to be sure)
  cy.findAllByText('Governance').filter(':visible').click();
  cy.findByText('+ New Proposal').click();

  cy.findByText('Create').click();
  cy.findByText('Title must have at least one alphanumeric character').should('exist');
  cy.findByText('Description must have at least one alphanumeric character').should('exist');
  cy.findByText('Make sure parameters is a valid JSON array').should('exist');

  // Correct the errors
  cy.findByLabelText('Title').type('some title');
  cy.findByLabelText('Description').type('best description');
  cy.findByLabelText('Parameters').type('{}');
  cy.findByText('Create').click();
  cy.findByText('Make sure parameters is a valid JSON array').should('exist');
  cy.findByLabelText('Parameters').clear().type('[]');
  cy.findByText('Create').click();

  // Expect contract signature error and let user fix it
  cy.findByText('Please specify a valid contract signature').should('exist');
  cy.findByLabelText('Target Contract Signature').type('transfer(address, unit256)');
  cy.findByText('Create').click();

  // Let user fix incorrect number of parameters
  cy.findByText('Please specify the correct number of function arguments').should('exist');
  cy.findByLabelText('Parameters')
    .clear()
    .type(JSON.stringify([ACCOUNTS[1], 12345]));
  cy.findByText('Create').click();

  // Catch the typo and let the user fix it
  cy.findByText('Ensure parameters match target contract signature').should('exist');
  cy.findByLabelText('Target Contract Signature').type('{backspace}'.repeat(8) + 'uint256)');
  cy.findByText('Create').click();

  // Fill target address and value
  cy.findByText('Please specify a valid account address').should('exist');
  cy.findByLabelText('Target Contract Address').type(ACCOUNTS[1]);
  cy.findByLabelText('ETH Value').type('-123456');
  cy.findByText('Create').click();

  // Fix the ETH value and create the proposal
  cy.findByText('Please enter valid non-negative ETH amount').should('exist');
  cy.findByLabelText('ETH Value').clear().type('123');
  cy.findByText('Create').click();

  // Expect the proposal to be created
  cy.resetClock();
  cy.findAllByText('Governance').filter(':visible').click();
  cy.findByText('some title', { timeout: 20 * 1000 }).should('exist');
  cy.dataCy('proposal-item').should('have.length', 1);
});
