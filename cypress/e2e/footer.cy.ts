import { HOME_PAGE } from '../support/common';

it('renders footer and error reporting', () => {
  cy.visit(HOME_PAGE).dataCy('error-reporting').should('exist');

  // Disallow error reporting
  cy.dataCy('error-reporting').find('input').click();
  cy.findByText('Done').click();
  cy.dataCy('error-reporting')
    .should('not.exist')
    .should(() => {
      expect(localStorage.getItem('reportErrors')).to.equal('false');
    });

  // On subsequent page visit there is no notice
  cy.reload().should(() => {
    expect(localStorage.getItem('reportErrors')).to.equal('false');
  });

  // Footer links should open the pages they link to in a new tab
  cy.findByText('Github').should('have.attr', 'target', '_blank');
});
