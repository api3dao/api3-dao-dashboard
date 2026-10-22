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
    pressTabAndAssertFocusOutline(() => cy.findAllByText('Governance History').filter(':visible').closest('a'));
    pressTabAndAssertFocusOutline(() => cy.findAllByText('Snapshot').filter(':visible').closest('a'));
    pressTabAndAssertFocusOutline(() => cy.findAllByText('DAO Docs').filter(':visible').closest('a'));

    pressTabAndAssertFocusOutline(() => cy.findByText('Go to Snapshot'));
    pressTabAndAssertFocusOutline(() => cy.findByTestId('connect-wallet-staking-btn'));
    pressTabAndAssertFocusOutline(() => cy.findByText('Api3.org'));
    pressTabAndAssertFocusOutline(() => cy.findByText('Error Reporting'));
    pressTabAndAssertFocusOutline(() => cy.findByText('Github'));
    pressTabAndAssertFocusOutline(() => cy.findByText('Privacy Policy'));
    pressTabAndAssertFocusOutline(() => cy.findByText('Privacy and Cookies'));
    pressTabAndAssertFocusOutline(() => cy.findByText('Terms and Conditions'));

    pressTabAndAssertFocusOutline(() => cy.dataCy('api3-logo')); // Completes the TAB cycle
  });
});
