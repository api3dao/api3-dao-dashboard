/// <reference path="../support/e2e.d.ts" />

import { ACCOUNTS, EPOCH_LENGTH } from '../support/common';

const CREATOR = ACCOUNTS[0];
const MINOR_VOTER = ACCOUNTS[1];
const MAJOR_VOTER = ACCOUNTS[2];

const PRIMARY_TITLE = 'Market Making and Liquidity Management';
const SECONDARY_TITLE = 'API3 DAO Operations Team Proposal Cycle #24';

function sendTokensAndStake(address: string, amount: string) {
  cy.exec(`pnpm send-to-account ${address} --tokens ${amount}`);
  cy.exec(`pnpm deposit-and-stake ${address} --deposit ${amount} --stake ${amount}`);
}

function createProposal(type: 'primary' | 'secondary', title: string, api3Token: string) {
  cy.exec(
    `pnpm create-proposal --type ${type} --title '${title}' --description 'A proposal from before the move to Snapshot' --target-signature 'transfer(address,uint256)' --parameters '["${CREATOR}", "1000000000000000000"]' --target-address ${api3Token} --target-value 0`
  );
}

describe('governance history', () => {
  before(() => {
    cy.resetBlockchain();

    cy.exec(`pnpm deposit-and-stake ${CREATOR} --deposit 100 --stake 100`);
    sendTokensAndStake(MINOR_VOTER, '50');
    sendTokensAndStake(MAJOR_VOTER, '400');
    cy.increaseTimeAndRelogin(EPOCH_LENGTH + 60 * 60); // skip the genesis epoch (add 1 hour just to be sure)

    cy.readFile('src/contract-deployments/localhost-dao.json').then((contracts) => {
      createProposal('primary', PRIMARY_TITLE, contracts.api3Token);
      cy.exec(`pnpm cast-vote ${MINOR_VOTER} --type primary --vote-id 0 --support false`);
      cy.exec(`pnpm cast-vote ${MAJOR_VOTER} --type primary --vote-id 0 --support true`); // decides and executes it

      // A user can create only one proposal per vote period
      cy.increaseTimeAndRelogin(EPOCH_LENGTH + 60 * 60);
      createProposal('secondary', SECONDARY_TITLE, contracts.api3Token);
      cy.exec(`pnpm cast-vote ${MAJOR_VOTER} --type secondary --vote-id 0 --support false`);
    });

    cy.increaseTimeAndRelogin(EPOCH_LENGTH + 60 * 60); // end the vote so the proposal shows in Governance History
  });

  // The tests only read the chain, so they share the state from the before hook
  beforeEach(() => {
    // Each test starts with the app on real time, which is behind the chain. Sync it, so the proposal timers show as
    // ended.
    cy.syncAppTimeWithChain();
    cy.login();
    cy.findAllByText('Governance History').filter(':visible').click();
  });

  it('shows past proposals', () => {
    cy.findByText('API3 DAO governance has moved to Snapshot.').should('exist');
    cy.findByRole('link', { name: 'Go to Snapshot' }).should('have.attr', 'href', 'https://snapshot.box/#/s:api3.eth');

    cy.dataCy('proposal-item').should('have.length', 2);
    // The newest proposal comes first
    cy.dataCy('proposal-item').first().should('contain', SECONDARY_TITLE).and('contain', 'Rejected');
    cy.dataCy('proposal-item').last().should('contain', PRIMARY_TITLE).and('contain', 'Executed');
    cy.percySnapshot('Governance History');
  });

  it('filters proposals by type', () => {
    // Deselect both
    cy.findByText('Primary').click();
    cy.findByText('Secondary').click();
    cy.findByText('There are no past proposals').should('exist');

    // Select primary
    cy.findByText('Primary').click();
    cy.dataCy('proposal-item').should('have.length', 1).and('contain', PRIMARY_TITLE);

    // Deselect primary again
    cy.findByText('Primary').click();
    cy.findByText('There are no past proposals').should('exist');

    // Select secondary
    cy.findByText('Secondary').click();
    cy.dataCy('proposal-item').should('have.length', 1).and('contain', SECONDARY_TITLE);
  });

  it('shows the details of a past proposal', () => {
    cy.findByRole('link', { name: PRIMARY_TITLE }).click();

    cy.findByRole('heading', { name: PRIMARY_TITLE }).should('exist');
    cy.findByText('Executed').should('exist');
    cy.findByTestId('timer').should('contain', 'Ended');
    cy.findByRole('button', { name: /vote/i }).should('not.exist');
    cy.percySnapshot('Governance History: Proposal details');
  });
});
