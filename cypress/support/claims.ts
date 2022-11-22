import { ACCOUNTS } from './common';

interface CreateParams {
  policyMetadata: string;
  coverageAmount: string;
  claimAmount: string;
}

export function createPolicyAndClaim(params: CreateParams) {
  return cy
    .exec(
      `yarn create-user-policy --address ${ACCOUNTS[0]} --metadata ${params.policyMetadata} --coverage-amount ${params.coverageAmount}`
    )
    .then((exec) => {
      const policyId = JSON.parse(exec.stdout.split('User policies (1):')[1].trim())[0];

      cy.visit(`/policies/${policyId}/claims/new`);
      cy.findByRole('button', { name: 'Next' }).click();
      cy.findByLabelText('Enter the IPFS hash to your Claim Evidence form').type(
        'QmPK1s3pNYLi9ERiq3BDxKa4XosgWwFRQUydHUtz4YgpqB',
        { delay: 0 }
      );
      cy.findByLabelText('Requested payout amount, in USD').type(params.claimAmount);
      cy.findByRole('button', { name: 'Next' }).click();
      cy.findByRole('button', { name: 'Submit Claim' }).click();

      return cy
        .findByTestId('claim-id')
        .invoke('text')
        .then((claimId) => {
          return { policyId, claimId };
        });
    });
}

export function assertClaimIsActive() {
  cy.findAllByTestId('claim-list-item').should('have.length', 1);
  cy.findByLabelText('Active').uncheck(); // Hide active claims
  cy.findAllByTestId('claim-list-item').should('have.length', 0);
  cy.findByLabelText('Active').check();
}

export function assertClaimIsInactive() {
  cy.findAllByTestId('claim-list-item').should('have.length', 1);
  cy.findByLabelText('Inactive').uncheck(); // Hide inactive claims
  cy.findAllByTestId('claim-list-item').should('have.length', 0);
  cy.findByLabelText('Inactive').check();
}
