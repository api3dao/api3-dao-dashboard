/// <reference path="../support/e2e.d.ts" />

import { constants, Contract } from 'ethers';
import { ACCOUNTS, EPOCH_LENGTH, ethersProvider, USER_ACCOUNT } from '../support/common';

const DELEGATE = ACCOUNTS[2];

function onChainDelegate() {
  return cy.readFile('src/contract-deployments/localhost-dao.json').then((contracts) => {
    const api3Pool = new Contract(
      contracts.api3Pool,
      ['function userDelegate(address) view returns (address)'],
      ethersProvider
    );
    return api3Pool.userDelegate(USER_ACCOUNT);
  });
}

describe('governance', () => {
  it('shows that DAO governance has moved and user can undelegate', () => {
    cy.resetBlockchain();
    cy.exec(`pnpm send-to-account ${USER_ACCOUNT} --tokens 100`);
    cy.exec(`pnpm deposit-and-stake ${USER_ACCOUNT} --deposit 100 --stake 100`);
    cy.exec(`pnpm delegate-voting-power ${USER_ACCOUNT} --delegate ${DELEGATE}`);
    // The delegation can be updated only once per epoch (add 1 hour just to be sure)
    cy.increaseTimeAndRelogin(EPOCH_LENGTH + 60 * 60);
    cy.findAllByText('Governance').filter(':visible').click();

    cy.findByText('API3 DAO governance has moved to Snapshot.').should('exist');
    cy.findByRole('link', { name: 'Go to Snapshot' }).should('have.attr', 'href').and('include', 'snapshot.box');
    cy.findByText('There are no active proposals').should('exist');
    cy.findByRole('button', { name: '+ New Proposal' }).should('be.disabled');
    cy.dataCy('delegated-to').should('have.text', `Delegated to: ${DELEGATE}`);
    cy.percySnapshot('Governance');

    cy.findByRole('button', { name: 'Undelegate' }).click();
    cy.findByRole('button', { name: 'Yes, Undelegate' }).click();
    cy.findByText('Success! Voting power undelegated.').should('exist');

    cy.findByText('Undelegated').should('exist');
    cy.findByRole('button', { name: 'Delegate' }).should('be.disabled');
    onChainDelegate().should('equal', constants.AddressZero);
  });
});
