import { addSeconds, formatISO } from 'date-fns';
import { ACCOUNTS } from '../support/common';

describe('Claim creation', () => {
  beforeEach(() => {
    cy.resetBlockchain().login();
  });

  it('goes through the New Claim steps', () => {
    cy.exec(
      'yarn concurrently ' +
        `"yarn create-user-policy --address ${ACCOUNTS[0]} --coverage-amount 45000 --metadata BTC/USD" ` + // Active policy
        `"yarn create-user-policy --address ${ACCOUNTS[0]} --claims-allowed-until '${formatISO(
          addSeconds(new Date(), -1)
        )}' --coverage-amount 27000 --metadata EUR/USD"` // Inactive policy
    );

    cy.findByRole('link', { name: 'My Claims' }).filter(':visible').click();
    cy.findByRole('heading', { name: /My Claims/i }).should('exist');
    cy.findByText(/You don't have any claims associated with the connected address./i).should('exist');
    cy.findByRole('button', { name: '+ New Claim' }).click();

    // Policy Details page
    cy.findByRole('heading', { name: 'BTC/USD' }).should('exist');
    cy.findByTestId('status').should('have.text', 'Active');
    cy.findByRole('button', { name: '+ New Claim' }).should('not.be.disabled');
    cy.findByTestId('remaining-coverage').should('have.text', '45,000.0 USD');
    cy.findByRole('button', { name: '+ New Claim' }).click();

    // Evidence step
    cy.findByRole('heading', { name: /Creating Evidence/i }).should('exist');
    cy.findByRole('button', { name: 'Next' }).click();

    // Capture step
    cy.findByRole('heading', { name: /Enter Claim Details/i }).should('exist');
    cy.findByTestId('usd-amount-field').should('contain.text', 'You can claim up to 45,000.0 USD');

    cy.findByRole('button', { name: 'Next' }).click(); // Trigger the display of the error messages
    cy.findByTestId('evidence-error').should('have.text', 'Please enter a valid hash');
    cy.findByTestId('usd-amount-error').should('have.text', 'Please enter a valid number');

    // Evidence validation
    enterIpfsHash('dfskdfp'); // Completely invalid
    cy.findByTestId('evidence-error').should('have.text', 'Please enter a valid hash');
    enterIpfsHash('QmPK1s3pNYLi9ERiq3BDxKa4XosgWwFRQUydHUtz4YgpqBa'); // Almost valid (has an extra character)
    cy.findByTestId('evidence-error').should('have.text', 'Please enter a valid hash');
    enterIpfsHash('QmPK1s3pNYLi9ERiq3BDxKa 4XosgWwFRQUydHUtz4YgpqB'); // Almost valid (has a space in the middle)
    cy.findByTestId('evidence-error').should('have.text', 'Please enter a valid hash');
    enterIpfsHash(' QmPK1s3pNYLi9ERiq3BDxKa4XosgWwFRQUydHUtz4YgpqB '); // Valid
    cy.findByTestId('evidence-error').should('not.exist');

    // USD amount validation
    enterUsdAmount('0');
    cy.findByTestId('usd-amount-error').should('have.text', 'Amount must be greater than zero');
    enterUsdAmount('0.01');
    cy.findByTestId('usd-amount-error').should('not.exist');
    enterUsdAmount('45000.01');
    cy.findByTestId('usd-amount-error').should('have.text', 'Amount must not exceed the coverage amount');
    enterUsdAmount('45000.00');
    cy.findByTestId('usd-amount-error').should('not.exist');
    enterUsdAmount('15000{enter}'); // The enter key should take us to the next step

    // Review step
    cy.findByRole('heading', { name: /Review Your Claim/i }).should('exist');
    cy.findByRole('button', { name: 'Submit Claim' }).click();
    cy.findByRole('heading', { name: /Thank you for submitting your claim/i }).should('exist');

    // Assert that the claim was created correctly
    cy.findByRole('link', { name: 'My Claims' }).filter(':visible').click();
    cy.findAllByTestId('claim-list-item').should('have.length', 1);
    cy.findByRole('link', { name: 'BTC/USD' }).click();

    // Claim Details page
    cy.findByRole('heading', { name: 'BTC/USD' }).should('exist');
    cy.findByTestId('status-prefix').should('have.text', 'API3 Mediators');
    cy.findByTestId('status').should('have.text', 'Evaluating');
    cy.findByRole('link', { name: 'https://ipfs.io/ipfs/QmPK1s3pNYLi9ERiq3BDxKa4XosgWwFRQUydHUtz4YgpqB' }).should(
      'have.attr',
      'href',
      'https://ipfs.io/ipfs/QmPK1s3pNYLi9ERiq3BDxKa4XosgWwFRQUydHUtz4YgpqB'
    );
    cy.findByTestId('claim-amount').should('have.text', '15,000.0 USD');
    cy.findByTestId('remaining-coverage').should('have.text', '45,000.0 USD');
    cy.findByTestId('settlement-amount').should('not.exist');
  });

  context('when the user has multiple active policies', () => {
    it('provides a Policy Select page', () => {
      cy.exec(
        'yarn concurrently ' +
          `"yarn create-user-policy --address ${ACCOUNTS[0]} --coverage-amount 45000 --metadata BTC/USD" ` + // Active policy
          `"yarn create-user-policy --address ${ACCOUNTS[0]} --coverage-amount 36000 --metadata ETH/USD" ` + // Active policy
          `"yarn create-user-policy --address ${ACCOUNTS[0]} --claims-allowed-until '${formatISO(
            addSeconds(new Date(), -1)
          )}' --coverage-amount 27000 --metadata EUR/USD" ` + // Inactive policy
          `"yarn create-user-policy --address ${ACCOUNTS[1]} --coverage-amount 18000 --metadata API3/USD"` // Active policy (different user)
      );

      cy.findByRole('link', { name: 'My Claims' }).filter(':visible').click();
      cy.findByRole('button', { name: '+ New Claim' }).click();

      // Policy Select page
      cy.findByRole('heading', { name: /Select a policy to use in your claim/i }).should('exist');
      cy.findAllByTestId('policy-list-item').should('have.length', 2); // Should only show active policies that belongs to the user
      cy.findByRole('link', { name: 'BTC/USD' }).should('exist');
      cy.findByRole('link', { name: 'ETH/USD' }).should('exist');

      // Searches by policy metadata
      cy.findByLabelText('Search for your policy').type(' eth {enter}');
      cy.findAllByTestId('policy-list-item').should('have.length', 1);
      cy.findByRole('link', { name: 'ETH/USD' }).click();

      // Policy Details page
      cy.findByRole('heading', { name: 'ETH/USD' }).should('exist');
      cy.findByTestId('status').should('have.text', 'Active');
      cy.findByRole('button', { name: '+ New Claim' }).should('not.be.disabled');
      cy.findByTestId('remaining-coverage').should('have.text', '36,000.0 USD');

      // Navigates back to the Policy Select page (with previous search intact)
      cy.findByRole('button', { name: 'Back' }).click();
      cy.findByRole('heading', { name: /Select a policy to use in your claim/i }).should('exist');
      cy.findByLabelText('Search for your policy').should('have.value', 'eth');
      cy.findAllByTestId('policy-list-item').should('have.length', 1);

      cy.findByLabelText('Search for your policy').clear().type('{enter}');
      cy.findAllByTestId('policy-list-item').should('have.length', 2);
    });
  });

  it('disallows claim creation when the policy is inactive', () => {
    cy.exec(
      `yarn create-user-policy --address ${ACCOUNTS[0]} --claims-allowed-until '${formatISO(
        addSeconds(new Date(), -1)
      )}' --coverage-amount 27000 --metadata EUR/USD` // Inactive policy
    ).then((exec) => {
      const policyId = JSON.parse(exec.stdout.split('User policies (1):')[1].trim())[0];
      cy.visit(`/policies/${policyId}`);

      // Policy Details page
      cy.findByRole('heading', { name: 'EUR/USD' }).should('exist');
      cy.findByTestId('status').should('have.text', 'Inactive');
      cy.findByRole('button', { name: '+ New Claim' }).should('be.disabled');

      // Redirects to Policy Details page
      cy.visit(`/policies/${policyId}/claims/new`);
      cy.findByRole('heading', { name: /Creating Evidence/i }).should('not.exist');
      cy.url().should('eq', Cypress.config('baseUrl') + `/policies/${policyId}`);
    });
  });
});

function enterIpfsHash(value: string) {
  cy.findByLabelText('Enter the IPFS hash to your Claim Evidence form').clear().type(value);
}

function enterUsdAmount(value: string) {
  cy.findByLabelText('Requested payout amount, in USD').clear().type(value);
}
