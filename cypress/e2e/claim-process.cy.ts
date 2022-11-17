import { ACCOUNTS } from '../support/common';

describe('Claim process', () => {
  beforeEach(() => {
    cy.resetBlockchain().login();
  });

  context('when the API3 Mediators accept the claim', () => {
    it('pays the user out', () => {
      cy.exec(`yarn create-user-policy --address ${ACCOUNTS[0]} --coverage-amount 45000 --metadata BTC/USD`).then(
        (exec) => {
          const policyId = JSON.parse(exec.stdout.split('User policies (1):')[1].trim())[0];
          cy.exec(
            `yarn claims:create-claim --policy-id ${policyId} --amount 1999.99 --evidence QmPK1s3pNYLi9ERiq3BDxKa4XosgWwFRQUydHUtz4YgpqB`
          );
        }
      );

      // My Claims page
      cy.findByRole('link', { name: 'My Claims' }).filter(':visible').click();
      cy.findAllByTestId('claim-list-item').should('have.length', 1);
      cy.findByTestId('claim-status').should('have.text', 'API3 Mediators (evaluating)');
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
    });
  });

  context('when the API3 Mediators propose a settlement', () => {
    it('pays the user out when they accept the settlement', () => {
      cy.exec(`yarn create-user-policy --address ${ACCOUNTS[0]} --coverage-amount 45000 --metadata BTC/USD`).then(
        (exec) => {
          const policyId = JSON.parse(exec.stdout.split('User policies (1):')[1].trim())[0];
          cy.exec(
            `yarn claims:create-claim --policy-id ${policyId} --amount 1999.99 --evidence QmPK1s3pNYLi9ERiq3BDxKa4XosgWwFRQUydHUtz4YgpqB`
          ).then((exec) => {
            const claimId = JSON.parse(exec.stdout.split('User claims (1):')[1].trim())[0];
            cy.exec(`yarn claims:propose-settlement --claim-id ${claimId} --amount 1200`);
          });
        }
      );

      // My Claims page
      cy.findByRole('link', { name: 'My Claims' }).filter(':visible').click();
      cy.findAllByTestId('claim-list-item').should('have.length', 1);
      cy.findByTestId('claim-status').should('have.text', 'API3 Mediators (settlement)');
      cy.findByRole('link', { name: 'BTC/USD' }).click();

      // Claim Details page
      cy.findByRole('heading', { name: 'BTC/USD' }).should('exist');
      cy.findByTestId('status-prefix').should('have.text', 'API3 Mediators');
      cy.findByTestId('status').should('have.text', 'Offered Settlement');
      cy.findByTestId('usd-amount').should('have.text', '1,200.0 USD');
      cy.findByTestId('api3-payout').should('not.exist');
      cy.findByTestId('remaining-coverage').should('have.text', '45,000.0 USD');
      cy.findByTestId('settlement-amount').should('have.text', '1,200.0 USD');

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
    });

    it('times out without payout', () => {
      cy.exec(`yarn create-user-policy --address ${ACCOUNTS[0]} --coverage-amount 45000 --metadata BTC/USD`).then(
        (exec) => {
          const policyId = JSON.parse(exec.stdout.split('User policies (1):')[1].trim())[0];
          cy.exec(
            `yarn claims:create-claim --policy-id ${policyId} --amount 1999.99 --evidence QmPK1s3pNYLi9ERiq3BDxKa4XosgWwFRQUydHUtz4YgpqB`
          ).then((exec) => {
            const claimId = JSON.parse(exec.stdout.split('User claims (1):')[1].trim())[0];
            cy.exec(`yarn claims:propose-settlement --claim-id ${claimId} --amount 1200`);
          });
        }
      );

      cy.increaseTimeAndRelogin(259200); // 3 days

      // My Claims page
      cy.findByRole('link', { name: 'My Claims' }).filter(':visible').click();
      cy.findAllByTestId('claim-list-item').should('have.length', 1);
      cy.findByTestId('claim-status').should('have.text', 'Timed Out');
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
});
