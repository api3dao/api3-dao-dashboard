import { ACCOUNTS } from '../support/common';
import { addDays, formatISO } from 'date-fns';

describe('Policy updates', () => {
  beforeEach(() => {
    cy.resetBlockchain().login();
  });

  it('handles both downgrades and upgrades', () => {
    const claimsAllowedFrom = formatISO(addDays(new Date(), -100));
    const claimsAllowedUntil = formatISO(addDays(new Date(), 100));
    cy.exec(
      `yarn create-user-policy --address ${ACCOUNTS[0]} --coverage-amount 27000 --metadata EUR/USD --claims-allowed-from ${claimsAllowedFrom} --claims-allowed-until '${claimsAllowedUntil}'`
    ).then((exec) => {
      const policyId = JSON.parse(exec.stdout.split('User policies (1):')[1].trim())[0];
      cy.visit(`/policies/${policyId}`);

      // Policy Details page
      cy.findByRole('heading', { name: 'EUR/USD' }).should('exist');
      cy.findByTestId('status').should('have.text', 'Active');
      cy.findByRole('button', { name: '+ New Claim' }).should('not.be.disabled');
      cy.findByTestId('remaining-coverage').should('have.text', '27,000.0 USD');

      // Downgrade
      cy.exec(
        `yarn downgrade-user-policy --policy-id ${policyId} --coverage-amount 10000 --claims-allowed-until ${formatISO(
          addDays(new Date(), -10)
        )}`
      );
      cy.findByTestId('status').should('have.text', 'Inactive');
      cy.findByRole('button', { name: '+ New Claim' }).should('be.disabled');
      cy.findByTestId('remaining-coverage').should('have.text', '10,000.0 USD');

      // Upgrade
      cy.exec(
        `yarn upgrade-user-policy --policy-id ${policyId} --coverage-amount 50000 --claims-allowed-until ${formatISO(
          addDays(new Date(), 10)
        )}`
      );
      cy.findByTestId('status').should('have.text', 'Active');
      cy.findByRole('button', { name: '+ New Claim' }).should('not.be.disabled');
      cy.findByTestId('remaining-coverage').should('have.text', '50,000.0 USD');
    });
  });

  it('handles metadata updates', () => {
    cy.exec(`yarn create-user-policy --address ${ACCOUNTS[0]} --coverage-amount 27000 --metadata 'EUR/USD - v1'`).then(
      (exec) => {
        const policyId = JSON.parse(exec.stdout.split('User policies (1):')[1].trim())[0];
        cy.visit(`/policies/${policyId}`);

        // Policy Details page
        cy.findByRole('heading', { name: 'EUR/USD - v1' }).should('exist');
        cy.exec(`yarn update-policy-metadata --policy-id ${policyId} --metadata 'EUR/USD - v2'`);
        cy.findByRole('heading', { name: 'EUR/USD - v2' }).should('exist');
      }
    );
  });
});
