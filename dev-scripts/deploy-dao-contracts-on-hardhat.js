/** Deploys the dao contracts on hardhat node running locally. It assumes that the dao-contracts directory has been
 * initialized already.
 */
const { bold, green } = require('chalk');
const { writeFileSync } = require('fs');
const { join } = require('path');
const { execAndLog, promiseWrapper } = require('./utils');

// NOTE: Change this to true in case you need more information to debug issues
const DEBUG = false;

const main = async () => {
  const rootDir = join(__dirname, '../');

  // Deploy the contracts locally on hardhat node. Assumes the contracts are already compiled
  const daoRepoContracts = await deployApi3DaoRepo(rootDir);
  const claimsManagerRepoContracts = await deployClaimsManagerRepo(rootDir);

  // Write the deployed contracts to the localhost-dao.json file
  const contracts = { ...daoRepoContracts, ...claimsManagerRepoContracts };
  const localhostDaoPath = join(rootDir, 'src/contract-deployments/localhost-dao.json');
  console.info(bold(green(`Writing deployed addresses to ${localhostDaoPath}...`)));
  writeFileSync(localhostDaoPath, JSON.stringify(contracts, null, 2));
};

const deployApi3DaoRepo = async (rootDir) => {
  const daoPackage = join(rootDir, 'dao-contracts/api3-dao/packages/dao');
  const { stdout } = await execAndLog(`cd ${daoPackage} && yarn deploy:rpc`, DEBUG);
  return JSON.parse(stdout.split('DEPLOYED ADDRESSES:')[1].trim());
};

const deployClaimsManagerRepo = async (rootDir) => {
  const claimsManagerRepo = join(rootDir, 'dao-contracts/claims-manager');
  const claimsManagerDeployScript = join(rootDir, 'dev-scripts/claims-manager/deploy-on-hardhat.js');
  const { stdout } = await execAndLog(
    `cd ${claimsManagerRepo} && npx hardhat run ${claimsManagerDeployScript} --network localhost`,
    DEBUG
  );
  return JSON.parse(stdout.split('DEPLOYED ADDRESSES:')[1].trim());
};

promiseWrapper(main);
