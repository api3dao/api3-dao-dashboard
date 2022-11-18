import { ACCOUNTS } from '../support/common';

describe('Claim process', () => {
  beforeEach(() => {
    cy.resetBlockchain().login();
  });

  context('when the API3 Mediators accept the claim', () => {
    it('pays the user out', () => {
      createPolicyAndClaim({ policyMetadata: 'BTC/USD', coverageAmount: '45000', claimAmount: '1999.99' });

      // My Claims page
      cy.findByRole('link', { name: 'My Claims' }).filter(':visible').click();
      cy.findAllByTestId('claim-list-item').should('have.length', 1);
      cy.findByTestId('claim-status').should('have.text', 'API3 Mediators (evaluating)');
      assertClaimIsActive();
      cy.findByRole('link', { name: 'BTC/USD' }).click();

      // Claim Details page
      cy.findByRole('heading', { name: 'BTC/USD' }).should('exist');
      cy.findByTestId('status-prefix').should('have.text', 'API3 Mediators');
      cy.findByTestId('status').should('have.text', 'Evaluating');
      cy.findByTestId('claim-amount').should('have.text', '1,999.99 USD');
      cy.findByTestId('remaining-coverage').should('have.text', '45,000.0 USD');

      cy.findByTestId('claim-id')
        .invoke('text')
        .then((claimId) => {
          cy.exec(`yarn claims:accept-claim --claim-id ${claimId}`);

          cy.findByTestId('notifications').should('contain.text', 'All done! The claim payout has been accepted.');
          cy.findByTestId('status-prefix').should('have.text', 'API3 Mediators');
          cy.findByTestId('status').should('have.text', 'Accepted');
          cy.findByTestId('usd-amount').should('have.text', '1,999.99 USD');
          cy.findByTestId('api3-payout').should('contain.text', '999.995 API3 tokens');
          cy.findByTestId('remaining-coverage').should('have.text', '43,000.01 USD');
          cy.findByTestId('settlement-amount').should('not.exist');
        });

      // Go back to My Claims page
      cy.findByRole('button', { name: 'Back' }).click();
      cy.findByRole('heading', { name: 'My Claims' });
      cy.findByTestId('claim-status').should('have.text', 'API3 Mediators (accepted)');
      assertClaimIsInactive();
    });
  });

  context('when the API3 Mediators propose a settlement', () => {
    beforeEach(() => {
      createPolicyAndClaim({ policyMetadata: 'BTC/USD', coverageAmount: '45000', claimAmount: '1999.99' }).then(
        ({ claimId }) => {
          cy.exec(`yarn claims:propose-settlement --claim-id ${claimId} --amount 1200`);
        }
      );
    });

    it('pays the user out when they accept the settlement', () => {
      // My Claims page
      cy.findByRole('link', { name: 'My Claims' }).filter(':visible').click();
      cy.findAllByTestId('claim-list-item').should('have.length', 1);
      cy.findByTestId('claim-status').should('have.text', 'API3 Mediators (settlement)');
      assertClaimIsActive();
      cy.findByRole('link', { name: 'BTC/USD' }).click();

      // Claim Details page
      cy.findByRole('heading', { name: 'BTC/USD' }).should('exist');
      cy.findByTestId('status-prefix').should('have.text', 'API3 Mediators');
      cy.findByTestId('status').should('have.text', 'Offered Settlement');
      cy.findByTestId('usd-amount').should('have.text', '1,200.0 USD');
      cy.findByTestId('api3-payout').should('not.exist');
      cy.findByTestId('remaining-coverage').should('have.text', '45,000.0 USD');
      cy.findByTestId('settlement-amount').should('have.text', '1,200.0 USD');

      cy.findByRole('button', { name: 'Escalate to Kleros' }).should('exist');
      // Accepts the settlement
      cy.findByRole('button', { name: 'Accept Settlement' }).click();
      // Confirmation modal
      cy.findByRole('dialog').within(() => {
        cy.findByRole('button', { name: 'Accept Settlement' }).click();
      });

      cy.findByTestId('notifications').should('contain.text', 'All done! The settlement was accepted and paid out.');
      cy.findByTestId('status-prefix').should('have.text', 'API3 Mediators');
      cy.findByTestId('status').should('have.text', 'Settled');
      cy.findByTestId('usd-amount').should('have.text', '1,200.0 USD');
      cy.findByTestId('api3-payout').should('contain.text', '600.0 API3 tokens');
      cy.findByTestId('remaining-coverage').should('have.text', '43,800.0 USD');

      // Go back to My Claims page
      cy.findByRole('button', { name: 'Back' }).click();
      cy.findByRole('heading', { name: 'My Claims' });
      cy.findByTestId('claim-status').should('have.text', 'API3 Mediators (settled)');
      assertClaimIsInactive();
    });

    it('times out when the user does not act within 72 hours', () => {
      cy.increaseTimeAndRelogin(259200); // 3 days

      // My Claims page
      cy.findByRole('link', { name: 'My Claims' }).filter(':visible').click();
      cy.findAllByTestId('claim-list-item').should('have.length', 1);
      cy.findByTestId('claim-status').should('have.text', 'Timed Out');
      assertClaimIsInactive();
      cy.findByRole('link', { name: 'BTC/USD' }).click();

      // Claim Details page
      cy.findByTestId('status').should('have.text', 'Timed Out');
      cy.findByTestId('notifications').should(
        'contain.text',
        'A settlement was offered by the API3 Mediators and wasn’t accepted within the required time period'
      );
      cy.findByTestId('remaining-coverage').should('have.text', '45,000.0 USD');
    });
  });

  context('when the API3 Mediators reject the claim', () => {
    it('makes the decision final when the user does not act within 72 hours', () => {
      createPolicyAndClaim({ policyMetadata: 'BTC/USD', coverageAmount: '45000', claimAmount: '1999.99' });

      // The API3 Mediators reject by not responding within the 3 days, so we go 6 days into the future
      cy.increaseTimeAndRelogin(259200 * 2);

      // My Claims page
      cy.findByRole('link', { name: 'My Claims' }).filter(':visible').click();
      cy.findAllByTestId('claim-list-item').should('have.length', 1);
      cy.findByTestId('claim-status').should('have.text', 'API3 Mediators (rejected)');
      assertClaimIsInactive();
      cy.findByRole('link', { name: 'BTC/USD' }).click();

      // Claim Details page
      cy.findByRole('heading', { name: 'BTC/USD' }).should('exist');
      cy.findByTestId('status-prefix').should('have.text', 'API3 Mediators');
      cy.findByTestId('status').should('have.text', 'Rejected');
      cy.findByRole('button', { name: 'Escalate to Kleros' }).should('not.exist');
      cy.findByTestId('notifications').should(
        'contain.text',
        'The claim was rejected by the API3 Mediators and wasn’t escalated to Kleros within the required time period'
      );
    });
  });
});

interface CreateParams {
  policyMetadata: string;
  coverageAmount: string;
  claimAmount: string;
}

function createPolicyAndClaim(params: CreateParams) {
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

function assertClaimIsActive() {
  cy.findAllByTestId('claim-list-item').should('have.length', 1);
  cy.findByLabelText('Active').uncheck(); // Hide active claims
  cy.findAllByTestId('claim-list-item').should('have.length', 0);
  cy.findByLabelText('Active').check();
}

function assertClaimIsInactive() {
  cy.findAllByTestId('claim-list-item').should('have.length', 1);
  cy.findByLabelText('Inactive').uncheck(); // Hide inactive claims
  cy.findAllByTestId('claim-list-item').should('have.length', 0);
  cy.findByLabelText('Inactive').check();
}
