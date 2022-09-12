/**
 * For localhost development, we depend on `localhost-dao.json` file which is gitignored because it will change after
 * each redeployment of the DAO contracts. However, we have to make sure it is created before we build the
 * application.
 */
const { join } = require('path');
const { existsSync } = require('fs');
const isEqual = require('lodash/isEqual');
const { promiseWrapper, execAndLog } = require('./utils');
const exampleAddresses = require('../src/contract-deployments/localhost-dao.example.json');

const main = async () => {
  const localAddressesPath = join(__dirname, '../src/contract-deployments/localhost-dao.json');
  if (existsSync(localAddressesPath)) {
    // We prevent overwriting an existing localhost-dao.json file if its keys (i.e. the contract names)
    // matches the example file's keys.
    const localAddresses = require(localAddressesPath);
    if (isEqual(Object.keys(localAddresses), Object.keys(exampleAddresses))) {
      return;
    }
  }

  await execAndLog('cd src/contract-deployments && cp localhost-dao.example.json localhost-dao.json');
};

promiseWrapper(main);
