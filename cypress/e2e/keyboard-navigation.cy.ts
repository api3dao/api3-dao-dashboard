/// <reference path="../support/e2e.d.ts" />

import { closeErrorReportingNotice } from '../support/common';

const pressTabAndAssertFocusOutline = (selector: () => Cypress.Chainable<any>) => {
  cy.tab();
  selector().should('have.css', 'box-shadow', 'rgb(3, 4, 18) 0px 0px 2.5px 1.5px');
};

describe('keyboard navigation and accessibility', () => {
  it('tab key cycle works', () => {
    cy.visit('http://localhost:3000/#/');

    closeErrorReportingNotice();
    pressTabAndAssertFocusOutline(() => cy.dataCy('api3-logo'));
    pressTabAndAssertFocusOutline(() => cy.findAllByText('Connect Wallet').parent().filter(':visible'));

    pressTabAndAssertFocusOutline(() => cy.findAllByText('Staking').filter(':visible').closest('a'));
    pressTabAndAssertFocusOutline(() => cy.findAllByText('Governance').filter(':visible').closest('a'));
    pressTabAndAssertFocusOutline(() => cy.findAllByText('History').filter(':visible').closest('a'));
    pressTabAndAssertFocusOutline(() => cy.findAllByText('Tracker').filter(':visible').closest('a'));
    pressTabAndAssertFocusOutline(() => cy.findAllByText('Forum').filter(':visible').closest('a'));
    pressTabAndAssertFocusOutline(() => cy.findAllByText('Api3 Market').filter(':visible').closest('a'));
    pressTabAndAssertFocusOutline(() => cy.findAllByText('Docs').filter(':visible').closest('a'));

    pressTabAndAssertFocusOutline(() => cy.findByTestId('connect-wallet-staking-btn'));
    pressTabAndAssertFocusOutline(() => cy.findByText('Api3.org'));
    pressTabAndAssertFocusOutline(() => cy.findByText('Error Reporting'));
    pressTabAndAssertFocusOutline(() => cy.findByText('Github'));
    pressTabAndAssertFocusOutline(() => cy.findByText('Privacy Policy'));
    pressTabAndAssertFocusOutline(() => cy.findByText('Privacy and Cookies'));
    pressTabAndAssertFocusOutline(() => cy.findByText('Terms and Conditions'));

    pressTabAndAssertFocusOutline(() => cy.dataCy('api3-logo')); // Completes the TAB cycle
  });

  describe('can use keyboard keys in modal', () => {
    beforeEach(() => {
      cy.resetBlockchain().login();
    });

    it('uses focus lock (cannot tab outside modal)', () => {
      cy.findByText('Deposit').click();

      cy.get('#modal').find('input').should('have.focus');
      cy.get('#modal').find('input').type('123');

      pressTabAndAssertFocusOutline(() => cy.findByText('Max'));
      pressTabAndAssertFocusOutline(() => cy.findByText('Approve'));
      pressTabAndAssertFocusOutline(() => cy.get('#modal').findByTestId('modal-close-button'));

      // Focus is returned to the modal input (and it's text is selected)
      cy.tab().get('#modal').find('input').should('have.focus');
      cy.get('#modal').findByTestId('modal-close-button').click();
    });

    it('can use keyboard to "press" the buttons', () => {
      // Can close the modal by pressing ESC
      cy.findByText('Deposit').click();
      cy.get('body').type('{esc}');
      cy.get('#modal').find('input').should('not.exist');

      // Can deposit by pressing ENTER when button has focus
      cy.findByText('Deposit').click();
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
