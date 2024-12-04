import { HOME_PAGE } from '../support/common';

it('renders footer and error reporting', () => {
  cy.visit(HOME_PAGE).dataCy('error-reporting').should('exist');

  // Enable error report and analytics
  cy.dataCy('error-reporting')
    .findByRole('button', { name: /accept all/i })
    .click();
  cy.dataCy('error-reporting')
    .should('not.exist')
    .then(() => {
      expect(localStorage.getItem('allow-error-reporting')).to.equal('true');
      expect(localStorage.getItem('allow-analytics')).to.equal('true');
    });

  // On subsequent page visit the error reporting notice should not be shown
  cy.reload().then(() => {
    expect(cy.dataCy('error-reporting').should('not.exist'));
  });

  // Open the privacy settings modal from the footer and disable error reporting and analytics
  cy.findByRole('button', { name: /error reporting/i }).click();
  cy.findByRole('button', { name: /manage settings/i }).click();
  cy.findByRole('checkbox', { name: /allow error reporting/i }).click();
  cy.findByRole('checkbox', { name: /allow analytics cookies/i }).click();
  cy.findByRole('button', { name: /save settings/i }).click();
  cy.dataCy('error-reporting')
    .should('not.exist')
    .then(() => {
      expect(localStorage.getItem('allow-error-reporting')).to.equal('false');
      expect(localStorage.getItem('allow-analytics')).to.equal('false');
    });

  // Footer links should open the pages they link to in a new tab
  cy.findByText('Github').should('have.attr', 'target', '_blank');
});
