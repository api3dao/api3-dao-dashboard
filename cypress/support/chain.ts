import { ethersProvider } from './common';

// Name of the file which will hold the information to be persisted between tests
const CYPRESS_SHARED_FILE = 'cypress-shared.json';

const SNAPSHOT_REVERT_ERROR_MESSAGE = `Snapshot revert failed. Please restart hardhat node, remove ${CYPRESS_SHARED_FILE} and try again`;

// Make sure the file is created and if not create empty JSON file
before(() => {
  cy.task('readFileMaybe', CYPRESS_SHARED_FILE).then((textOrNull: unknown) => {
    if (textOrNull === null) cy.writeFile(CYPRESS_SHARED_FILE, JSON.stringify({}));
  });
});

interface SharedState {
  // Snapshot id of the initial blockchain state (saved before all tests)
  evmSnapshotId?: string;
  // Custom snapshots created by createChainSnapshot
  customSnapshots?: {
    [key: string]: string;
  };
}

const restoreAndSaveBlockchainSnapshot = () => {
  cy.log('restoreAndSaveBlockchainSnapshot');

  cy.readFile(CYPRESS_SHARED_FILE).then(async (json: SharedState) => {
    // Restore blockchain snapshot if we have one
    if (json.evmSnapshotId) {
      // Expect the snapshot revert to succeed
      expect(await ethersProvider.send('evm_revert', [json.evmSnapshotId]), SNAPSHOT_REVERT_ERROR_MESSAGE).to.equal(
        true
      );
    }

    // Save the current (or restored) state of the blockchain
    const evmSnapshotId = await ethersProvider.send('evm_snapshot', []);
    const newState = { ...json, evmSnapshotId } as SharedState;
    cy.writeFile(CYPRESS_SHARED_FILE, JSON.stringify(newState));
  });
};

// Before hook in a support file executes as the first thing when you run the tests. This will make sure the chain state
// is saved before the tests are run. This works even when you restart the ETH node, because reverting to an invalid
// snapshot is handled (RPC response is false).
before(restoreAndSaveBlockchainSnapshot);
// Reset the blockchain state after tests and remove the shared file to preserve the original state of blockchain. This
// makes sure that blockchain operations are reverted after the tests are done.
//
// NOTE: This callback might never get called, because of how cypress works. See:
// https://docs.cypress.io/guides/references/best-practices#Using-after-or-afterEach-hooks
after(() => {
  restoreAndSaveBlockchainSnapshot();
  cy.exec('rm -rf cypress-shared.json');
});
// NOTE: We can't reset the blockchain snapshot before each test, because it messes up the custom snapshots
// Specifically: We save the initial blockchain snapshot 1, then we save custom snapshot 2 and our test ends. New test
// begins and we would revert to snapshot 1. See internal-tests.spec.ts for a test demonstration.
Cypress.Commands.add('resetBlockchain', restoreAndSaveBlockchainSnapshot);

Cypress.Commands.add('createChainSnapshot', (name: string) => {
  cy.log('createChainSnapshot');

  cy.readFile(CYPRESS_SHARED_FILE).then(async (json: SharedState) => {
    const custom = json.customSnapshots || {};

    if (custom[name]) cy.log(`Overriding snapshot name ${name}`);
    const evmSnapshotId = await ethersProvider.send('evm_snapshot', []);

    const newState = { ...json, customSnapshots: { ...custom, [name]: evmSnapshotId } } as SharedState;
    cy.writeFile(CYPRESS_SHARED_FILE, JSON.stringify(newState));
  });
});

Cypress.Commands.add('useChainSnapshot', (name: string) => {
  cy.log('useChainSnapshot');

  cy.readFile(CYPRESS_SHARED_FILE).then(async (json: SharedState) => {
    const custom = json.customSnapshots || {};

    if (!custom[name]) throw new Error(`No snapshot named ${name}. Make sure you call 'createSnapshot' beforehand.`);
    const oldSnapshotId = custom[name];
    // Expect the snapshot revert to succeed
    expect(await ethersProvider.send('evm_revert', [oldSnapshotId]), SNAPSHOT_REVERT_ERROR_MESSAGE).to.equal(true);

    const newSnapshotId = await ethersProvider.send('evm_snapshot', []);
    const newState = { ...json, customSnapshots: { ...custom, [name]: newSnapshotId } } as SharedState;
    cy.writeFile(CYPRESS_SHARED_FILE, JSON.stringify(newState));
  });

  // Re-login to make sure app uses the data from the blockchain snapshot
  cy.login();
});
