import { assertClaimIsActive, assertClaimIsInactive, createPolicyAndClaim } from '../support/claims';

describe('Claim process with arbitration', () => {
  beforeEach(() => {
    cy.resetBlockchain().login();
  });

  context('when the Kleros jurors rule to pay the claim', () => {
    it('executes the payout after giving the API3 Mediators a chance to appeal', () => {
      createPolicyAndClaim({ policyMetadata: 'BTC/USD', coverageAmount: '45000', claimAmount: '1999.99' }).then(
        ({ claimId }) => {
          cy.exec(`yarn claims:propose-settlement --claim-id ${claimId} --amount 1200`);
        }
      );

      // My Claims page
      cy.findByRole('link', { name: 'My Claims' }).filter(':visible').click();
      cy.findByRole('link', { name: 'BTC/USD' }).click();

      // Claim Details page
      cy.findByRole('heading', { name: 'BTC/USD' }).should('exist');
      // Escalate
      cy.findByRole('button', { name: 'Escalate to Kleros' }).click();
      cy.findByRole('dialog').within(() => {
        cy.findByRole('heading', { name: 'Escalation Cost' }).should('exist');
        cy.findByTestId('cost').should('have.text', '0.075 ETH');
        cy.findByRole('button', { name: 'Escalate' }).click();
      });

      cy.findByTestId('notifications').should(
        'contain.text',
        'The claim was escalated to Kleros. Kleros jurors are currently evaluating your claim'
      );
      cy.findByTestId('status-prefix').should('have.text', 'Kleros');
      cy.findByTestId('status').should('have.text', 'Evaluating');

      getDisputeIdFromDisputeResolverLink().then((disputeId) => {
        cy.exec(`yarn claims:arbitrator-decide-to-pay --dispute-id ${disputeId} --appeal-period-length 0`);

        cy.findByRole('heading', { name: 'Appeal Period' }).should('exist');
        cy.findByTestId('notifications').should(
          'contain.text',
          'During this appeal period the API3 Mediators have the opportunity to appeal Kleros’s ruling'
        );
        cy.findByRole('button', { name: 'Appeal' }).should('not.exist');
        cy.findByTestId('status-prefix').should('have.text', 'Kleros');
        cy.findByTestId('status').should('have.text', 'Accepted');
        cy.findByTestId('usd-amount').should('have.text', '1,999.99 USD');

        // Pass the appeal period
        cy.exec(`yarn claims:pass-dispute-period --dispute-id ${disputeId}`);
      });

      cy.findByRole('link', { name: 'My Claims' }).filter(':visible').click();
      assertClaimIsActive();
      cy.findByRole('link', { name: 'BTC/USD' }).click();

      cy.findByRole('heading', { name: 'Appeal Period' }).should('not.exist');
      cy.findByTestId('status-prefix').should('have.text', 'Kleros');
      cy.findByTestId('status').should('have.text', 'Accepted');

      cy.findByRole('button', { name: 'Execute Payout' }).click();
      cy.findByRole('dialog').within(() => {
        cy.findByRole('heading', { name: 'You will be paid in API3 tokens' }).should('exist');
        cy.findByRole('button', { name: 'Execute Payout' }).click();
      });

      cy.findByTestId('notifications').should('contain.text', 'All done! The claim payout has been accepted.');
      cy.findByTestId('status-prefix').should('have.text', 'Kleros');
      cy.findByTestId('status').should('have.text', 'Accepted');
      cy.findByTestId('usd-amount').should('have.text', '1,999.99 USD');
      cy.findByTestId('api3-payout').should('contain.text', '999.995 API3 tokens');
      cy.findByTestId('remaining-coverage').should('have.text', '43,000.01 USD');

      // Go back to My Claims page
      cy.findByRole('button', { name: 'Back' }).click();
      cy.findByRole('heading', { name: 'My Claims' }).should('exist');
      cy.findAllByTestId('claim-list-item').should('have.length', 1);
      cy.findByTestId('claim-status').should('have.text', 'Kleros (accepted)');
      assertClaimIsInactive();
    });
  });

  context('when the Kleros jurors rule to pay the settlement', () => {
    it('starts the dispute process over when the user appeals the ruling', () => {
      createPolicyAndClaim({ policyMetadata: 'BTC/USD', coverageAmount: '45000', claimAmount: '1999.99' }).then(
        ({ claimId }) => {
          cy.exec(`yarn claims:propose-settlement --claim-id ${claimId} --amount 1200`);
        }
      );

      // My Claims page
      cy.findByRole('link', { name: 'My Claims' }).filter(':visible').click();
      cy.findByRole('link', { name: 'BTC/USD' }).click();

      // Claim Details page
      cy.findByRole('heading', { name: 'BTC/USD' }).should('exist');
      cy.findByRole('button', { name: 'Escalate to Kleros' }).click();

      cy.findByRole('dialog').within(() => {
        cy.findByRole('heading', { name: 'Escalation Cost' }).should('exist');
        cy.findByTestId('cost').should('have.text', '0.075 ETH');
        cy.findByRole('button', { name: 'Escalate' }).click();
      });

      cy.findByTestId('notifications').should(
        'contain.text',
        'The claim was escalated to Kleros. Kleros jurors are currently evaluating your claim'
      );
      cy.findByTestId('status-prefix').should('have.text', 'Kleros');
      cy.findByTestId('status').should('have.text', 'Evaluating');

      getDisputeIdFromDisputeResolverLink().then((disputeId) => {
        cy.exec(
          `yarn claims:arbitrator-decide-to-pay-settlement --dispute-id ${disputeId} --appeal-period-length 30000`
        );
      });

      cy.findByRole('heading', { name: 'Appeal Period' }).should('exist');
      cy.findByTestId('notifications').should(
        'contain.text',
        'During this appeal period you have the opportunity to appeal Kleros’s ruling'
      );
      cy.findByTestId('status-prefix').should('have.text', 'Kleros');
      cy.findByTestId('status').should('have.text', 'Accepted Settlement');
      cy.findByTestId('usd-amount').should('have.text', '1,200.0 USD');

      cy.findByRole('button', { name: 'Appeal' }).click();
      cy.findByRole('dialog').within(() => {
        cy.findByRole('heading', { name: 'Appeal Cost' }).should('exist');
        cy.findByTestId('cost').should('have.text', '0.175 ETH');
        cy.findByRole('button', { name: 'Appeal' }).click();
      });

      cy.findByRole('heading', { name: 'Appeal Period' }).should('not.exist');
      cy.findByTestId('notifications').should(
        'contain.text',
        'You appealed Kleros’s ruling. Kleros jurors are currently evaluating your claim'
      );
      cy.findByTestId('status-prefix').should('have.text', 'Kleros');
      cy.findByTestId('status').should('have.text', 'Evaluating');
    });
  });
});

function getDisputeIdFromDisputeResolverLink() {
  return cy
    .findByRole('link', { name: 'View Dispute Resolver' })
    .invoke('attr', 'href')
    .should('match', /https:\/\/resolve.kleros.io\/cases\/\d/)
    .then((url) => {
      return url!.split('https://resolve.kleros.io/cases/')[1];
    });
}
