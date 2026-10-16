import { providers } from 'ethers';
import { closeErrorReportingNotice, ethersProvider, HOME_PAGE } from './common';

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

// The app time runs this far ahead of the real time, so that it matches the chain time after a time travel. We do not
// use cy.clock(), because it freezes the time, and ethers then never detects new blocks (it caches the block number
// based on the time). As a result, the app would not update after a transaction.
let chainTimeOffset = 0;

beforeEach(() => {
  chainTimeOffset = 0;
});

Cypress.on('window:before:load', (win) => {
  const RealDate = win.Date;
  const now = () => RealDate.now() + chainTimeOffset;
  win.Date = new Proxy(RealDate, {
    construct: (target, args) => (args.length === 0 ? new target(now()) : new (target as any)(...args)),
    get: (target, property) => (property === 'now' ? now : Reflect.get(target, property)),
  });
});

Cypress.Commands.add('syncAppTimeWithChain', () => {
  cy.log('syncAppTimeWithChain');

  // Mines a block, because the latest block can be older than the current chain time
  cy.wrap<Promise<providers.Block>, providers.Block>(
    ethersProvider.send('evm_mine', []).then(() => ethersProvider.getBlock('latest'))
  ).then((block) => {
    chainTimeOffset = block.timestamp * 1000 - Date.now();
  });
});

Cypress.Commands.add('increaseTimeAndRelogin', (timeInSeconds: number) => {
  cy.log('increaseTimeAndRelogin');

  cy.wrap(ethersProvider.send('evm_increaseTime', [timeInSeconds]));
  cy.syncAppTimeWithChain();

  // Re-login to make sure app uses the increased time
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
  cy.visit(HOME_PAGE); // This is noop ife we are already on this page

  // If we are already connected (dangling state from previous test), let's disconnect
  //
  // NOTE: This is ugly, because such pattern is discouraged. See:
  // https://docs.cypress.io/guides/core-concepts/conditional-testing#The-problem
  cy.get('body').then((res) => {
    // We can't use dataCy directly, because if the element is not present cypress will fail the test
    if (res.find('[data-cy=connected-status]:visible').length !== 0) {
      cy.dataCy('connected-status').filter(':visible').click();
      cy.findAllByText('Disconnect').filter(':visible').click();
    }
  });

  // Login
  cy.findAllByRole('button', { name: 'Connect Wallet' }).first().click();

  // Web3 Modal
  cy.get('w3m-modal')
    .shadow()
    .find('w3m-router')
    .should('be.visible')
    .shadow()
    .find('w3m-connect-view')
    .shadow()
    .find('wui-list-wallet')
    .eq(1)
    .shadow()
    .find('button')
    .click();

  cy.findAllByText('Connected to hardhat').filter(':visible').should('exist');

  // Close the error reporting notice if it is present
  cy.get('footer').then((el) => {
    if (el.text().match(/Allow error reporting/i)) {
      closeErrorReportingNotice();
    }
  });
});

Cypress.Commands.add('dataCy', (value) => {
  cy.get(`[data-cy=${value}]`);
});

Cypress.Commands.add('switchAccount', (index: number) => {
  cy.dataCy('connected-status').filter(':visible').click();
  cy.findAllByText('Change account').filter(':visible').click();
  cy.dataCy('available-accounts').children().eq(index).click();
});
