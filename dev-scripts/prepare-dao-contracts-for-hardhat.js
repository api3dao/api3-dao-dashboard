/** Script which downloads the DAO contracts repository, installs necessary dependencies and compiles the contracts such
 * that they are ready to be deployed to hardhat node for developing locally.
 */

const chalk = require('chalk');
const { readFileSync } = require('fs');
const { join } = require('path');

const exec = require('util').promisify(require('child_process').exec);

// NOTE: Change this to true in case you need more information to debug issues
const DEBUG = false;

const execAndLog = async (command) => {
  console.info(chalk.bold(`Command: "${command}"`));
  const { stdout, stderr } = await exec(command);
  if (DEBUG) {
    console.info(`Stdout: ${stdout}`);
    console.info(chalk.red(`Stderr: ${stderr}`));
  }
};

const main = async () => {
  const rootDir = join(__dirname, '../');

  // Remove dao-contracts directory (if exists)
  await execAndLog(`cd ${rootDir} && rm -rf dao-contracts`);

  // Clones the repository
  await execAndLog(`cd ${rootDir} && git clone https://github.com/api3dao/api3-dao.git dao-contracts`);

  // Read the package.json to know what version to clone and checkout to it
  const commitSha = JSON.parse(readFileSync(join(rootDir, 'package.json'))).devDependencies['api3-dao'].split('#')[1];
  const daoContractsDir = join(rootDir, 'dao-contracts');
  await execAndLog(`cd ${daoContractsDir} && git checkout ${commitSha}`);

  // We need to remove package.locks because it causes npm to throw an error when installing deps
  await execAndLog(`cd ${daoContractsDir} && find ./packages -name "package-lock.json" -type f -delete`);

  // Install dependencies
  await execAndLog(`cd ${daoContractsDir} && npm run bootstrap`);
};

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(chalk.red(`Error: ${error}`));
    process.exit(1);
  });
