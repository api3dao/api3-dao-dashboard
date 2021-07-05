import { abbrStr, ACCOUNTS } from '../support/common';

describe('delegation', () => {
  before(() => {
    cy.resetBlockchain().login();

    // Approve, deposit and stake
    cy.findByText('+ Deposit').click();
    cy.get('input').type('200');
    cy.findByText('Approve').click();
    cy.findByText('Deposit and Stake').click();
    cy.dataCy('staked').should('have.text', '200.0'); // Ensure transaction is mined

    cy.createChainSnapshot('user-staked');
  });

  it('can delegate', () => {
    cy.useChainSnapshot('user-staked');

    // Delegate to different account
    cy.findAllByText('Governance').filter(':visible').click();
    cy.findByText('Delegate').click();
    cy.get('input').type(ACCOUNTS[1]);
    cy.get('#modal').findByText('Delegate').click();

    cy.dataCy('delegated-to').should('have.text', `Delegated to: ${abbrStr(ACCOUNTS[1])}`);
  });

  // TODO: implement proposal voting tests
});
