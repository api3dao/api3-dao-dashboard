/// <reference path="../support/index.d.ts" />

import { EPOCH_LENGTH } from '../support/common';

describe('Malicious proposal validation', () => {
  it('shows a warning if the original EVM script and the decoded EVM script does not match', () => {
    cy.increaseTimeAndRelogin(EPOCH_LENGTH + 60 * 60); // skip the genesis epoch (add 1 hour just to be sure)
    /*
      Original EVM script: transfer(address,uint256)
      Decoded EVM script: transfer(address,int32)
     */
    cy.exec(
      `yarn create-proposal --type secondary --title 'API3 DAO BD-API Team Proposal' --description 'https://ipfs.fleek.co/ipfs/bafybeicfguu3bfhk3fyz5zn5wlujpksqxsaokse37674fhylouvsqnwd2m' --target-signature 'transfer(address,int32)' --parameters '["0xCB943E4Fb0bCf7eC3C2E6D263c275b27F07701c6", "111363670000"]' --target-address 0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48 --target-value 0 --script 0x00000001556ecbb0311d350491ba0ec7e019c354d7723ce0000000e4b61d27f6000000000000000000000000a0b86991c6218b36c1d19d4a2e9eb0ce3606eb48000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000600000000000000000000000000000000000000000000000000000000000000044a9059cbb000000000000000000000000cb943e4fb0bcf7ec3c2e6d263c275b27f07701c600000000000000000000000000000000000000000000000000000019edcabff000000000000000000000000000000000000000000000000000000000`
    );

    cy.findAllByText('Governance').filter(':visible').click();
    // Navigate to proposal
    cy.findByRole('link', { name: 'API3 DAO BD-API Team Proposal' }).click();
    cy.findByText(/This proposal is potentially malicious/i).should('exist');
  });

  it('does not show a warning if the original EVM script and the decoded EVM script matches up', () => {
    cy.increaseTimeAndRelogin(EPOCH_LENGTH + 60 * 60); // skip the genesis epoch (add 1 hour just to be sure)
    cy.exec(
      `yarn create-proposal --type secondary --title 'API3 DAO BD-API Team Proposal' --description 'https://ipfs.fleek.co/ipfs/bafybeicfguu3bfhk3fyz5zn5wlujpksqxsaokse37674fhylouvsqnwd2m' --target-signature 'transfer(address,uint256)' --parameters '["0xCB943E4Fb0bCf7eC3C2E6D263c275b27F07701c6", "111363670000"]' --target-address 0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48 --target-value 0`
    );

    cy.findAllByText('Governance').filter(':visible').click();
    // Navigate to proposal
    cy.findByRole('link', { name: 'API3 DAO BD-API Team Proposal' }).click();
    cy.findByText(/This proposal is potentially malicious/i).should('not.exist');
  });
});
