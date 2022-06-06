/** Script which downloads the DAO contract repositories, installs necessary dependencies and compiles the contracts such
 * that they are ready to be deployed to hardhat node for developing locally.
 */

const { readFileSync } = require('fs');
const { join } = require('path');
const { execAndLog, promiseWrapper } = require('./utils');

// NOTE: Change this to true in case you need more information to debug issues
const DEBUG = false;

const main = async () => {
  const rootDir = join(__dirname, '../');
  const daoContractsDir = join(rootDir, 'dao-contract-repos');
  // Remove dao-contract-repos directory (if exists)
  await execAndLog(`cd ${rootDir} && rm -rf dao-contract-repos`, DEBUG);
  await execAndLog(`mkdir ${daoContractsDir}`, DEBUG);

  const packageJson = JSON.parse(readFileSync(join(rootDir, 'package.json')));
  await prepareApi3DaoRepo(daoContractsDir, packageJson);
  await prepareClaimsManagerRepo(daoContractsDir, packageJson);
};

const prepareApi3DaoRepo = async (daoContractsDir, packageJson) => {
  // Clones the repository
  await execAndLog(`cd ${daoContractsDir} && git clone https://github.com/api3dao/api3-dao.git api3-dao`, DEBUG);

  // Read the package.json to know what version to clone and checkout to it
  const commitSha = packageJson.devDependencies['api3-dao'].split('#')[1];
  const api3DaoDir = join(daoContractsDir, 'api3-dao');
  await execAndLog(`cd ${api3DaoDir} && git checkout ${commitSha}`, DEBUG);

  // NOTE: Calling `yarn bootstrap` doesn't work when executed using `exec` when runing as part of github actions
  const isGithubActions = process.argv[2] === '--github-actions';
  if (isGithubActions) return;

  // We need to remove package.locks because it causes npm to throw an error when installing deps
  await execAndLog(`cd ${api3DaoDir} && find ./packages -name "package-lock.json" -type f -delete`, DEBUG);

  // Install dependencies
  // NOTE: We need to use npm, because yarn doesn't work reliably for some reason
  await execAndLog(`cd ${api3DaoDir} && npm run bootstrap`, DEBUG);
};

const prepareClaimsManagerRepo = async (daoContractsDir, packageJson) => {
  // Clone the repository
  await execAndLog(
    `cd ${daoContractsDir} && git clone https://github.com/api3dao/claims-manager.git claims-manager`,
    DEBUG
  );

  // Read the package.json to know what version to clone and checkout to it
  const commitSha = packageJson.devDependencies['claims-manager'].split('#')[1];
  const claimsManagerDir = join(daoContractsDir, 'claims-manager');
  await execAndLog(`cd ${claimsManagerDir} && git checkout ${commitSha}`, DEBUG);

  // Install dependencies and build
  await execAndLog(`cd ${claimsManagerDir} && yarn && yarn build`, DEBUG);
};

promiseWrapper(main);
