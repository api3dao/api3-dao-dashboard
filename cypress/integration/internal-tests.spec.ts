import { abbrStr, ACCOUNTS, ethersProvider } from '../support/common';

it('snapshots reverts are destructive (later snapshots are destroyed)', async () => {
  const s1 = await ethersProvider.send('evm_snapshot', []);
  const s2 = await ethersProvider.send('evm_snapshot', []);
  const s3 = await ethersProvider.send('evm_snapshot', []);

  // Responses should be consecutive hexadecimals numbers
  const toInt = (n: string) => parseInt(n, 16);
  const int1 = toInt(s1);
  const int2 = toInt(s2);
  const int3 = toInt(s3);
  expect(int1).to.equal(int2 - 1);
  expect(int2).to.equal(int3 - 1);

  // Reverting to any of the snapshots is possible
  const r1 = await ethersProvider.send('evm_revert', [s1]);
  expect(r1).to.equal(true);

  // But what happened after such snapshot is inevitably lost (false response means unknown snapshot)
  const r2 = await ethersProvider.send('evm_revert', [s2]);
  expect(r2).to.equal(false);
  const r3 = await ethersProvider.send('evm_revert', [s3]);
  expect(r3).to.equal(false);
});

it('multiple login command work without errors', () => {
  cy.login().login();
});

it('can switch account', () => {
  cy.login();

  cy.dataCy('account').filter(':visible').should('have.text', abbrStr(ACCOUNTS[0]));
  cy.switchAccount(2);
  cy.dataCy('account').filter(':visible').should('have.text', abbrStr(ACCOUNTS[2]));
});
