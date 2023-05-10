/// <reference path="../support/e2e.d.ts" />

import { ACCOUNTS, EPOCH_LENGTH } from '../support/common';

it('new proposal form validation', () => {
  cy.increaseTimeAndRelogin(EPOCH_LENGTH + 60 * 60); // skip the genesis epoch (add 1 hour just to be sure)
  cy.findAllByText('Governance').filter(':visible').click();
  cy.findByText('+ New Proposal').click();

  // Let's create a secondary proposal
  cy.findByLabelText('Secondary').should('be.checked');

  cy.findByText('Create').click();
  cy.findByText('Title must have at least one alphanumeric character').should('exist');
  cy.findByText('Description must have at least one alphanumeric character').should('exist');
  cy.findByText('Please specify a valid account address').should('exist');
  cy.percySnapshot('Governance: New proposal modal', { minHeight: 1500 });

  // Correct the errors, but fill in invalid parameters
  cy.findByLabelText('Title').type('Getting University Blockchain Groups Involved in Governance');
  cy.findByLabelText('Description').type('https://forum.api3.org/t/getting-university-blockchain-groups-involved');
  cy.findByLabelText('Parameters').type('{}');
  cy.findByText('Create').click();

  // Let user fix invalid parameters, but make them inconsistent with the target contract signature
  cy.findByText('Make sure parameters is a valid JSON array').should('exist');
  cy.findByLabelText('Parameters').clear().type('[]');
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
  cy.findByLabelText('Target Address').type(ACCOUNTS[1]);
  cy.findByLabelText('Value (Wei)').type('-123456');
  cy.findByText('Create').click();

  // Fix the value and create the proposal
  cy.findByText('Please enter a valid amount in Wei').should('exist');
  cy.findByLabelText('Value (Wei)').clear().type('123');
  cy.findByText('Create').click();

  // Expect the proposal to be created
  cy.resetClock();
  cy.findAllByText('Governance').filter(':visible').click();
  cy.findByText('Getting University Blockchain Groups Involved in Governance', { timeout: 20 * 1000 }).should('exist');
  cy.dataCy('proposal-item').should('have.length', 1).and('contain.text', 'secondary');
  cy.percySnapshot('Governance: Active proposals');

  // Navigate to proposal
  cy.findByRole('link', { name: 'Getting University Blockchain Groups Involved in Governance' }).click();
  cy.percySnapshot('Proposal details');
});
