import { ACCOUNTS } from '../support/common';

describe('Claim creation', () => {
  before(() => {
    cy.login();
  });

  it('goes through the New Claim steps', () => {
    cy.exec(`yarn create-user-policy --address ${ACCOUNTS[0]} --coverage-amount 45000 --metadata 'BTC/USD'`);

    cy.findByRole('link', { name: 'My Claims' }).filter(':visible').click();
    cy.findByRole('heading', { name: /My Claims/i }).should('exist');
    cy.findByText(/You don't have any claims associated with the connected address./i).should('exist');
    cy.findByRole('button', { name: '+ New Claim' }).click();

    cy.findByRole('heading', { name: 'BTC/USD' }).should('exist');
    cy.findByTestId('remaining-coverage').should('have.text', '45,000.0 USD');
    cy.findByRole('button', { name: '+ New Claim' }).click();

    // Evidence step
    cy.findByRole('heading', { name: /Creating Evidence/i }).should('exist');
    cy.findByRole('button', { name: 'Next' }).click();

    // Capture step
    cy.findByRole('heading', { name: /Enter Claim Details/i }).should('exist');
    cy.findByTestId('usd-amount').should('contain.text', 'You can claim up to 45,000.0 USD');

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
});

function enterIpfsHash(value: string) {
  cy.findByLabelText('Enter the IPFS hash to your Claim Evidence form').clear().type(value);
}

function enterUsdAmount(value: string) {
  cy.findByLabelText('Requested payout amount, in USD').clear().type(value);
}
