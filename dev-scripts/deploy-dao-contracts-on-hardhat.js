/** Deploys the dao contracts on hardhat node running locally. It assumes the dao-contracts repository has been
 * initialized already.
 */
const { bold, green } = require('chalk');
const { writeFileSync } = require('fs');
const { join } = require('path');
const { execAndLog, promiseWrapper } = require('./utils');

// NOTE: Change this to true in case you need more information to debug issues
const DEBUG = true;

const main = async () => {
  const rootDir = join(__dirname, '../');

  // Deploy the contracts locally on hardhat node. Assumes the contracts are already compiled
  if (DEBUG) {
    console.info(bold(`Deploying contracts on hardhat ...`));
  }
  const daoPackage = join(rootDir, 'dao-contracts/packages/dao');
  const { stdout, stderr } = await execAndLog(`cd ${daoPackage} && yarn deploy:rpc`, DEBUG);
  if (stderr) {
    throw new Error(stderr);
  }

  // Write the deployed contracts to the localhost-dao.json file
  const contracts = stdout.split('DEPLOYED ADDRESSES:')[1].trim();
  const localhostDaoPath = join(rootDir, 'src/contract-deployments/localhost-dao.json');
  console.info(bold(green(`Writing deployed addresses to ${localhostDaoPath}...`)));
  writeFileSync(localhostDaoPath, contracts);
};

promiseWrapper(main);
