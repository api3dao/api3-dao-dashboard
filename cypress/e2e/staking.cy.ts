/// <reference path="../support/e2e.d.ts" />

import { Contract, utils } from 'ethers';
import { EPOCH_LENGTH, ethersProvider, USER_ACCOUNT } from '../support/common';

// The pool keeps rewards minted in the last 52 epochs locked
const REWARD_VESTING_PERIOD = 52 * EPOCH_LENGTH;

function sendTokensToUser(amount: string) {
  cy.exec(`pnpm send-to-account ${USER_ACCOUNT} --tokens ${amount}`);
}

function depositAndStake(depositAmount: string, stakeAmount: string) {
  cy.exec(`pnpm deposit-and-stake ${USER_ACCOUNT} --deposit ${depositAmount} --stake ${stakeAmount}`);
}

// The user holds all the voting power, so their vote alone passes the migration vote
function migrateDao() {
  cy.exec(`pnpm execute-migration-vote ${USER_ACCOUNT}`);
}

function initiateUnstake(amount: string | 'max') {
  cy.findByRole('button', { name: 'Initiate Unstake' }).click();
  if (amount === 'max') {
    cy.get('#modal').findByRole('button', { name: 'Max' }).click();
  } else {
    cy.get('#modal').find('input').type(amount);
  }
  cy.findByRole('button', { name: 'Initiate Unstaking' }).click();
  cy.findByRole('button', { name: 'Yes, Initiate Unstaking' }).click(); // confirm the unstake in the second modal
  closeNotification('Success! Initiated unstaking of API3 tokens.');
  cy.findByText('Pending API3 tokens unstaking').should('exist');
}

function unstake() {
  cy.findAllByRole('button', { name: 'Unstake' }).first().click();
  closeNotification('Success! API3 tokens unstaked.');
  cy.dataCy('pending-unstake').should('not.exist');
}

function withdraw(amount: string | 'max') {
  cy.findByRole('button', { name: 'Withdraw' }).click();
  if (amount === 'max') {
    cy.get('#modal').findByRole('button', { name: 'Max' }).click();
  } else {
    cy.get('#modal').find('input').type(amount);
  }
  cy.get('#modal').findByRole('button', { name: 'Withdraw' }).click();
  closeNotification('Success! API3 tokens withdrawn.');
}

function closeNotification(message: string) {
  cy.findByText(message).click();
  cy.findByText(message).should('not.exist');
}

function onChainBalance() {
  return cy
    .readFile('src/contract-deployments/localhost-dao.json')
    .then((contracts) => {
      const api3Token = new Contract(
        contracts.api3Token,
        ['function balanceOf(address) view returns (uint256)'],
        ethersProvider
      );
      return api3Token.balanceOf(USER_ACCOUNT);
    })
    .then((balance) => utils.formatEther(balance));
}

describe('after the DAO migration', () => {
  before(() => {
    cy.resetBlockchain();
    sendTokensToUser('500');
    depositAndStake('500', '100');
    cy.increaseTimeAndRelogin(EPOCH_LENGTH + 60 * 60); // skip the genesis epoch, which allows no votes
    migrateDao();
    cy.login();

    onChainBalance().should('equal', '0.0');
    cy.dataCy('balance').should('have.text', '500.0');
    cy.dataCy('unstaked').should('have.text', '400.0');
    cy.dataCy('withdrawable').should('have.text', '400.0');
    cy.dataCy('staked').should('have.text', '100.0');
    cy.percySnapshot('Staking: Successfully staked');

    // Create a snapshot of blockchain
    cy.createChainSnapshot('user-staked');
  });

  it('shows that DAO governance has moved and disables deposits and staking', () => {
    cy.useChainSnapshot('user-staked');

    cy.findByText('API3 DAO governance has moved to Snapshot.').should('exist');
    cy.findByRole('link', { name: 'Go to Snapshot' }).should('have.attr', 'href', 'https://snapshot.box/#/s:api3.eth');
    cy.findByRole('button', { name: 'Deposit' }).should('be.disabled');
    cy.findByRole('button', { name: 'Stake' }).should('be.disabled');
  });

  it('user can unstake', () => {
    cy.useChainSnapshot('user-staked');

    initiateUnstake('20');
    cy.dataCy('balance').should('have.text', '480.0');
    cy.dataCy('staked').should('have.text', '80.0');
    cy.dataCy('amount').should('have.text', '20.0');

    cy.increaseTimeAndRelogin(EPOCH_LENGTH + 60 * 60); // add 1 hour to be sure unstake time passed
    cy.findAllByRole('button', { name: 'Unstake' }).should('have.length', 2);
    cy.percySnapshot('Staking: Pending unstaking');
    unstake();

    // No reward is minted, although an epoch has passed
    cy.dataCy('balance').should('have.text', '500.0');
    cy.dataCy('staked').should('have.text', '80.0');
    cy.dataCy('unstaked').should('have.text', '420.0');
    cy.dataCy('withdrawable').should('have.text', '420.0');
    onChainBalance().should('equal', '0.0');
  });

  it('user can withdraw', () => {
    cy.useChainSnapshot('user-staked');

    withdraw('50');
    cy.dataCy('withdrawable').should('have.text', '350.0');
    cy.dataCy('unstaked').should('have.text', '350.0');
    onChainBalance().should('equal', '50.0');
  });

  it('user can unstake & withdraw', () => {
    cy.useChainSnapshot('user-staked');

    initiateUnstake('50');
    cy.dataCy('balance').should('have.text', '450.0');
    cy.dataCy('staked').should('have.text', '50.0');
    cy.dataCy('amount').should('have.text', '50.0');

    cy.increaseTimeAndRelogin(EPOCH_LENGTH + 60 * 60); // add 1 hour to be sure unstake time passed
    cy.findAllByRole('button', { name: 'Unstake and Withdraw' }).first().click();
    closeNotification('Success! API3 tokens unstaked and withdrawn.');
    cy.dataCy('pending-unstake').should('not.exist');

    // No reward is minted, although an epoch has passed
    cy.dataCy('balance').should('have.text', '450.0');
    cy.dataCy('staked').should('have.text', '50.0');
    cy.dataCy('unstaked').should('have.text', '400.0');
    onChainBalance().should('equal', '50.0');
  });
});

describe('pool activity from before the DAO migration', () => {
  beforeEach(() => {
    cy.resetBlockchain();
  });

  it('user can complete an unstake initiated before the DAO migration', () => {
    sendTokensToUser('500');
    depositAndStake('500', '100');
    cy.login();
    initiateUnstake('20');

    cy.increaseTimeAndRelogin(EPOCH_LENGTH + 60 * 60); // add 1 hour to be sure unstake time passed
    migrateDao();
    unstake();

    // No reward is minted, although an epoch has passed
    cy.dataCy('balance').should('have.text', '500.0');
    cy.dataCy('staked').should('have.text', '80.0');
    cy.dataCy('unstaked').should('have.text', '420.0');
    cy.dataCy('withdrawable').should('have.text', '420.0');
    onChainBalance().should('equal', '0.0');
  });

  it('user can withdraw rewards minted before the DAO migration, once they unlock', () => {
    sendTokensToUser('1000');
    depositAndStake('1000', '1000');
    cy.increaseTimeAndRelogin(EPOCH_LENGTH + 60 * 60); // skip the genesis epoch, which has no reward
    cy.exec('pnpm mint-reward');
    migrateDao();

    cy.dataCy('staked').should('have.text', '1,007.43');
    cy.dataCy('withdrawable').should('have.text', '0.0');

    initiateUnstake('max');
    cy.increaseTimeAndRelogin(EPOCH_LENGTH + 60 * 60); // add 1 hour to be sure unstake time passed
    unstake();

    // The minted reward stays locked
    cy.dataCy('staked').should('have.text', '0.0');
    cy.dataCy('unstaked').should('have.text', '1,007.43');
    cy.dataCy('withdrawable').should('have.text', '1,000.0');
    withdraw('max');
    cy.dataCy('balance').should('have.text', '7.43');
    cy.dataCy('withdrawable').should('have.text', '0.0');
    onChainBalance().should('equal', '1000.0');

    cy.increaseTimeAndRelogin(REWARD_VESTING_PERIOD);
    cy.dataCy('withdrawable').should('have.text', '7.43');
    withdraw('max');
    cy.dataCy('balance').should('have.text', '0.0');
    onChainBalance().should('equal', '1007.431506849315068491');
  });
});
