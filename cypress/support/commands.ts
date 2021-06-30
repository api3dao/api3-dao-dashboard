import { ethersProvider } from './common';

// -- This is a parent command -- Cypress.Commands.add('login', (email, password) => { ... })
//
//
// -- This is a child command -- Cypress.Commands.add('drag', { prevSubject: 'element'}, (subject, options) => { ... })
//
//
// -- This is a dual command -- Cypress.Commands.add('dismiss', { prevSubject: 'optional'}, (subject, options) => { ...
// })
//
//
// -- This will overwrite an existing command -- Cypress.Commands.overwrite('visit', (originalFn, url, options) => { ...
// })
//
// NOTE: Not everything should be a custom command and it's perfectly fine to encapsulate login in JS functions. See:
// https://docs.cypress.io/api/cypress-api/custom-commands#1-Don-t-make-everything-a-custom-command

Cypress.Commands.add('increaseTimeAndRelogin', (timeInSeconds: number) => {
  cy.log('increaseTimeAndRelogin');

  cy.wrap(ethersProvider.send('evm_increaseTime', [timeInSeconds])).then(() =>
    cy.clock(Date.now() + 1000 * timeInSeconds, ['Date'])
  );

  // Re-login to make sure app uses the increased time
  cy.login();
});

Cypress.Commands.add('resetClock', () => {
  cy.log('resetClock');

  cy.clock().then((clock) => {
    clock.restore();
  });

  // Re-login to make sure app uses the restored time
  cy.login();
});

Cypress.Commands.add('login', () => {
  cy.log('login');

  cy.on('window:before:load', async (win) => {
    // The request `request` function is defined when we use Metamask, so we mock it
    (ethersProvider as any).request = ({ method, params }: any) => {
      if (method === 'eth_requestAccounts') method = 'eth_accounts';
      return ethersProvider.send(method, params);
    };
    // Simulate injected metamask metamask provider
    (win as any).ethereum = ethersProvider;
  });
  cy.visit('http://localhost:3000/#/'); // This is noop ife we are already on this page

  // If we are already connected (dangling state from previous test), let's disconnect
  //
  // NOTE: This is ugly, because such pattern is discouraged. See:
  // https://docs.cypress.io/guides/core-concepts/conditional-testing#The-problem
  cy.get('body').then((res) => {
    // We can't use dataCy directly, because if the element is not present cypress will fail the test
    if (res.find('[data-cy=connected-status]:visible').length !== 0) {
      cy.dataCy('connected-status').filter(':visible').click();
      cy.findAllByText('Disconnect Wallet').filter(':visible').click();
    }
  });

  // Login
  cy.findByRole('button', { name: 'Connect Wallet' }).click();
  cy.findByText('Web3').click();
  cy.findAllByText('Connected to localhost').filter(':visible').should('exist');
});

Cypress.Commands.add('dataCy', (value) => {
  cy.get(`[data-cy=${value}]`);
});

Cypress.Commands.add('switchAccount', (index: number) => {
  cy.dataCy('connected-status').filter(':visible').click();
  cy.findAllByText('Change account').filter(':visible').click();
  cy.dataCy('available-accounts').children().eq(index).click();
});
