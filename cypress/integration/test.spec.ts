import { providers } from 'ethers';

it('works', () => {
  // TODO: create command from this
  cy.on('window:before:load', async (win) => {
    const ethersProvider = new providers.JsonRpcProvider('http://localhost:8545');

    // The request `request` function is defined when we use Metamask, so we mock it
    (ethersProvider as any).request = ({ method, params }: any) => {
      if (method === 'eth_requestAccounts') method = 'eth_accounts';
      return ethersProvider.send(method, params);
    };
    // Simulate injected metamask metamask provider
    (win as any).ethereum = ethersProvider;
  });

  cy.visit('http://localhost:3000/#/');
  cy.findByRole('button', { name: 'Connect Wallet' }).click();
  cy.findByText('Web3').click();
  // We have to use findAllByText and filter visible, because we have both mobile and desktop menu present
  // although one of them is always hidden. However cypress returns both of them.
  cy.findAllByText('Connected to localhost').filter(':visible').should('exist');
});
