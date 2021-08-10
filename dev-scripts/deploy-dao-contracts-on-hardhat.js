/** Deploys the dao contracts on hardhat node running locally. It assumes the dao-contracts repository has been
 * initialized already.
 */
const chalk = require('chalk');
const { writeFileSync } = require('fs');
const { join } = require('path');

const exec = require('util').promisify(require('child_process').exec);

// NOTE: Change this to true in case you need more information to debug issues
const DEBUG = false;

const execAndLog = async (command) => {
  console.info(chalk.bold(`Command: "${command}"`));
  const output = await exec(command);

  const { stdout, stderr } = output;
  if (DEBUG) {
    console.info(`Stdout: ${stdout}`);
    console.info(chalk.red(`Stderr: ${stderr}`));
  }

  return output;
};

const main = async () => {
  const rootDir = join(__dirname, '../');

  // Deploy the contracts locally on hardhat node. Assumes the contracts are already compiled
  const daoPackage = join(rootDir, 'dao-contracts/packages/dao');
  const { stdout } = await execAndLog(`cd ${daoPackage} && npm run deploy:rpc`);

  // Write the deployed contracts to the localhost-dao.json file
  const contracts = stdout.split('DEPLOYED ADDRESSES:')[1].trim();
  const localhostDaoPath = join(rootDir, 'src/contract-deployments/localhost-dao.json');
  writeFileSync(localhostDaoPath, contracts);
};

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(chalk.red(`Error: ${error}`));
    process.exit(1);
  });
