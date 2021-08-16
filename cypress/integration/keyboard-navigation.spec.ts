/// <reference path="../support/index.d.ts" />

import { closeErrorReportingNotice } from '../support/common';

const pressTabAndAssertFocusOutline = (selector: () => Cypress.Chainable<unknown>) => {
  cy.tab();
  selector().should('have.css', 'box-shadow', 'rgb(255, 255, 255) 0px 0px 2.5px 1.5px');
};

describe('keyboard navigation and accessibility', () => {
  before('login', () => {
    cy.resetBlockchain().visit('http://localhost:3000/#/');
  });

  it('tab key cycle works', () => {
    closeErrorReportingNotice();
    pressTabAndAssertFocusOutline(() => cy.dataCy('api3-logo'));
    pressTabAndAssertFocusOutline(() => cy.findAllByText('Connect Wallet').filter(':visible'));

    pressTabAndAssertFocusOutline(() => cy.findAllByText('Staking').filter(':visible').closest('a'));
    pressTabAndAssertFocusOutline(() => cy.findAllByText('Governance').filter(':visible').closest('a'));
    pressTabAndAssertFocusOutline(() => cy.findAllByText('History').filter(':visible').closest('a'));

    pressTabAndAssertFocusOutline(() => cy.findByText('About API3'));
    pressTabAndAssertFocusOutline(() => cy.findByText('Docs'));
    pressTabAndAssertFocusOutline(() => cy.findByText('Error Reporting'));
    pressTabAndAssertFocusOutline(() => cy.findByText('Github'));

    pressTabAndAssertFocusOutline(() => cy.dataCy('api3-logo')); // Completes the TAB cycle
  });

  describe('can use keyboard keys in modal', () => {
    before(() => {
      cy.login();
      closeErrorReportingNotice();
    });

    it('uses focus lock (cannot tab outside modal)', () => {
      cy.findByText('+ Deposit').click();

      cy.get('#modal').find('input').should('have.focus');
      cy.get('#modal').find('input').type('123');

      pressTabAndAssertFocusOutline(() => cy.findByText('Max'));
      pressTabAndAssertFocusOutline(() => cy.findByText('Approve'));
      pressTabAndAssertFocusOutline(() => cy.get('#modal').find('img')); // Close icon

      // Focus is returned to the modal input (and it's text is selected)
      cy.tab().get('#modal').find('input').should('have.focus');
      cy.get('#modal').find('img').click(); // Close the modal
    });

    it('can use keyboard to "press" the buttons', () => {
      // Can close the modal by pressing ESC
      cy.findByText('+ Deposit').click();
      cy.get('body').type('{esc}');
      cy.get('#modal').find('input').should('not.exist');

      // Can deposit by pressing ENTER when button has focus
      cy.findByText('+ Deposit').click();
      cy.get('#modal').find('input').type('123').tab(); // Tab over "Max" button
      pressTabAndAssertFocusOutline(() => cy.findByText('Approve'));

      // NOTE: There is a bug in cypress that focused elements cannot trigger "click" by pressing ENTER
      // See: https://github.com/cypress-io/cypress/issues/8267#issuecomment-743918524
      cy.get('#modal').find('input').focus();
      cy.findByText('Approve').type('{enter}'); // Approve
      cy.findByText('Deposit and Stake').should('not.be.disabled');
      cy.findByText('Deposit and Stake').type('{enter}');

      // Assert dashboard balance
      cy.dataCy('balance').should('have.text', '123.0');
    });
  });
});
