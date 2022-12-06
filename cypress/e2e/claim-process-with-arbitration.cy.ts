import { createPolicyAndClaim, assertClaimIsInactive, assertClaimIsActive } from '../support/claims';

describe('Claim process with arbitration', () => {
  beforeEach(() => {
    cy.resetBlockchain().login();
  });

  context('when the Kleros jurors rule to pay the claim', () => {
    context('when the appeal period passes and the bot fails to execute the ruling', () => {
      it('allows the user to execute the ruling themselves', () => {
        createPolicyAndClaim({ policyMetadata: 'BTC/USD', coverageAmount: '45000', claimAmount: '1999.99' }).then(
          ({ claimId }) => {
            cy.exec(`yarn claims:propose-settlement --claim-id ${claimId} --amount 1200`);
          }
        );

        // My Claims page
        cy.findByRole('link', { name: 'My Claims' }).filter(':visible').click();
        cy.findAllByTestId('claim-list-item').should('have.length', 1);
        cy.percySnapshot('My Claims');
        cy.findByRole('link', { name: 'BTC/USD' }).click();

        // Claim Details page
        escalateToKleros();
        cy.percySnapshot('Claim Details: Kleros Evaluating');

        getDisputeIdFromDisputeResolverLink().then((disputeId) => {
          // We set the appeal period length to zero so that we can immediately pass the appeal period
          cy.exec(`yarn claims:arbitrator-decide-to-pay --dispute-id ${disputeId} --appeal-period-length 0`);

          // Appeal period
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

        // Execution period
        cy.findByRole('heading', { name: 'Appeal Period' }).should('not.exist');
        cy.findByTestId('status-prefix').should('have.text', 'Kleros');
        cy.findByTestId('status').should('have.text', 'Accepted');

        // Execute the ruling
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
        cy.percySnapshot('Claim Details: Kleros Accepted');

        // Go back to My Claims page
        cy.findByRole('button', { name: 'Back' }).click();
        cy.findByRole('heading', { name: 'My Claims' }).should('exist');
        cy.findAllByTestId('claim-list-item').should('have.length', 1);
        cy.findByTestId('claim-status').should('have.text', 'Kleros (accepted)');
        assertClaimIsInactive();
      });
    });
  });

  context('when the Kleros jurors rule to pay the settlement', () => {
    it('resolves the claim as settled when the appeal period passes', () => {
      createPolicyAndClaim({ policyMetadata: 'BTC/USD', coverageAmount: '45000', claimAmount: '1999.99' }).then(
        ({ claimId }) => {
          cy.exec(`yarn claims:propose-settlement --claim-id ${claimId} --amount 1200`);
        }
      );

      // My Claims page
      cy.findByRole('link', { name: 'My Claims' }).filter(':visible').click();
      cy.findByRole('link', { name: 'BTC/USD' }).click();

      // Claim Details page
      escalateToKleros();
      getDisputeIdFromDisputeResolverLink().then((disputeId) => {
        // We set the appeal period length to zero so that we can immediately resolve the dispute
        cy.exec(`yarn claims:arbitrator-decide-to-pay-settlement --dispute-id ${disputeId} --appeal-period-length 0`);

        // Appeal period
        cy.findByRole('heading', { name: 'Appeal Period' }).should('exist');
        cy.findByRole('button', { name: 'Appeal' }).should('exist');
        cy.findByTestId('notifications').should(
          'contain.text',
          'During this appeal period you have the opportunity to appeal Kleros’s ruling'
        );
        cy.findByTestId('status-prefix').should('have.text', 'Kleros');
        cy.findByTestId('status').should('have.text', 'Accepted Settlement');
        cy.findByTestId('usd-amount').should('have.text', '1,200.0 USD');
        cy.findByTestId('timer').should('contain.text', 'Ended');
        cy.percySnapshot('Claim Details: Kleros Accepted Settlement (Appeal Period)');

        // Resolve the dispute
        cy.exec(`yarn claims:resolve-dispute --dispute-id ${disputeId}`);
      });

      cy.findByRole('heading', { name: 'Appeal Period' }).should('not.exist');
      cy.findByTestId('notifications').should('contain.text', 'All done! The settlement was accepted and paid out.');
      cy.findByTestId('status-prefix').should('have.text', 'Kleros');
      cy.findByTestId('status').should('have.text', 'Settled');
      cy.findByTestId('usd-amount').should('have.text', '1,200.0 USD');
      cy.findByTestId('api3-payout').should('contain.text', '600.0 API3 tokens');
      cy.findByTestId('remaining-coverage').should('have.text', '43,800.0 USD');
      cy.percySnapshot('Claim Details: Kleros Settled');

      // Go back to My Claims page
      cy.findByRole('button', { name: 'Back' }).click();
      cy.findByRole('heading', { name: 'My Claims' }).should('exist');
      cy.findAllByTestId('claim-list-item').should('have.length', 1);
      cy.findByTestId('claim-status').should('have.text', 'Kleros (settled)');
      assertClaimIsInactive();
    });
  });

  context('when the Kleros jurors rule to reject the claim', () => {
    it('resolves the claim as rejected when the appeal period passes', () => {
      createPolicyAndClaim({ policyMetadata: 'BTC/USD', coverageAmount: '45000', claimAmount: '1999.99' }).then(
        ({ claimId }) => {
          cy.exec(`yarn claims:propose-settlement --claim-id ${claimId} --amount 1200`);
        }
      );

      // My Claims page
      cy.findByRole('link', { name: 'My Claims' }).filter(':visible').click();
      cy.findByRole('link', { name: 'BTC/USD' }).click();

      // Claim Details page
      escalateToKleros();
      getDisputeIdFromDisputeResolverLink().then((disputeId) => {
        // We set the appeal period length to zero so that we can immediately resolve the dispute
        cy.exec(`yarn claims:arbitrator-decide-not-to-pay --dispute-id ${disputeId} --appeal-period-length 0`);

        // Appeal period
        cy.findByRole('heading', { name: 'Appeal Period' }).should('exist');
        cy.findByTestId('notifications').should(
          'contain.text',
          'During this appeal period you and the API3 Mediators have the opportunity to appeal Kleros’s ruling'
        );
        cy.findByRole('button', { name: 'Appeal' }).should('exist');
        cy.findByTestId('status-prefix').should('have.text', 'Kleros');
        cy.findByTestId('status').should('have.text', 'Rejected');

        // Resolve the dispute
        cy.exec(`yarn claims:resolve-dispute --dispute-id ${disputeId}`);
      });

      cy.findByTestId('notifications').should(
        'contain.text',
        'The ruling wasn’t appealed to Kleros within the required time period'
      );
      cy.findByTestId('status-prefix').should('have.text', 'Kleros');
      cy.findByTestId('status').should('have.text', 'Rejected');
      cy.findByTestId('remaining-coverage').should('have.text', '45,000.0 USD');

      // Go back to My Claims page
      cy.findByRole('button', { name: 'Back' }).click();
      cy.findByRole('heading', { name: 'My Claims' }).should('exist');
      cy.findAllByTestId('claim-list-item').should('have.length', 1);
      cy.findByTestId('claim-status').should('have.text', 'Kleros (rejected)');
      assertClaimIsInactive();
    });
  });

  context("when the user appeals the Kleros jury's ruling", () => {
    it('restarts the dispute process', () => {
      createPolicyAndClaim({ policyMetadata: 'BTC/USD', coverageAmount: '45000', claimAmount: '1999.99' }).then(
        ({ claimId }) => {
          cy.exec(`yarn claims:propose-settlement --claim-id ${claimId} --amount 1200`);
        }
      );

      // My Claims page
      cy.findByRole('link', { name: 'My Claims' }).filter(':visible').click();
      cy.findByRole('link', { name: 'BTC/USD' }).click();

      // Claim Details page
      escalateToKleros();
      getDisputeIdFromDisputeResolverLink().then((disputeId) => {
        const appealPeriodLength = 24 * 60 * 60;
        cy.exec(
          `yarn claims:arbitrator-decide-to-pay-settlement --dispute-id ${disputeId} --appeal-period-length ${appealPeriodLength}`
        );
      });

      // Appeal period
      cy.findByRole('button', { name: 'Appeal' }).click();
      cy.findByRole('dialog').within(() => {
        cy.findByRole('heading', { name: 'Appeal Cost' }).should('exist');
        cy.findByTestId('cost').should('have.text', '0.175 ETH');
        cy.findByRole('button', { name: 'Appeal' }).click();
      });

      // Dispute process is restarted
      cy.findByRole('heading', { name: 'Appeal Period' }).should('not.exist');
      cy.findByTestId('notifications').should(
        'contain.text',
        'You appealed Kleros’s ruling. Kleros jurors are currently evaluating your claim'
      );
      cy.findByTestId('status-prefix').should('have.text', 'Kleros');
      cy.findByTestId('status').should('have.text', 'Evaluating');
    });
  });

  context('when the API3 Mediators reject the claim', () => {
    it('allows the user to escalate to Kleros', () => {
      createPolicyAndClaim({ policyMetadata: 'BTC/USD', coverageAmount: '45000', claimAmount: '1999.99' });

      // The API3 Mediators reject by not responding within the 3 days
      cy.increaseTimeAndRelogin(3 * 24 * 60 * 60);

      // My Claims page
      cy.findByRole('link', { name: 'My Claims' }).filter(':visible').click();
      cy.findByRole('link', { name: 'BTC/USD' }).click();

      // Claim Details page
      cy.findByTestId('status-prefix').should('have.text', 'API3 Mediators');
      cy.findByTestId('status').should('have.text', 'Rejected');
      cy.findByTestId('notifications').should(
        'contain.text',
        'If you don’t escalate to Kleros within the remaining time, the rejection will be accepted'
      );

      // Escalate
      cy.findByRole('button', { name: 'Escalate to Kleros' }).click();
      cy.findByRole('dialog').within(() => {
        cy.findByRole('heading', { name: 'Escalation Cost' }).should('exist');
        cy.findByTestId('cost').should('have.text', '0.075 ETH');
        cy.percySnapshot('Claim Details: Escalation Cost Modal');
        cy.findByRole('button', { name: 'Escalate' }).click();
      });

      // Reset the clock in order to get the new block
      cy.resetClock();

      // My Claims page
      cy.findByRole('link', { name: 'My Claims' }).filter(':visible').click();
      cy.findAllByTestId('claim-list-item').should('have.length', 1);
      cy.findByTestId('claim-status').should('have.text', 'Kleros (evaluating)');
      assertClaimIsActive();
    });
  });
});

function escalateToKleros() {
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
  cy.findByTestId('timer').should('contain.text', '09D');
}

function getDisputeIdFromDisputeResolverLink() {
  return cy
    .findByRole('link', { name: 'View Dispute Resolver' })
    .invoke('attr', 'href')
    .should('match', /https:\/\/resolve.kleros.io\/cases\/\d/)
    .then((url) => {
      return url!.split('https://resolve.kleros.io/cases/')[1];
    });
}
