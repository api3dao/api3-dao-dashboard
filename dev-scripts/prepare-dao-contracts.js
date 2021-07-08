/** DAO dashboard depends on the DAO contracts in https://github.com/api3dao/api3-dao/. We depend on a specific version
 * of the contracts listed in package.json. We also generate TS wrappers for those contracts, but in order to do so, we
 * need to make sure they can be compiled and that requires some hacks.
 *
 * NOTE: It doesn't really matter what hacks we do as we only this to generate the TS interfaces. The only requirement
 * is that the contract API should remain the same.
 */
const chalk = require('chalk');
const replace = require('replace-in-file');
const exec = require('util').promisify(require('child_process').exec);

// NOTE: Change this to true in case you need more information to debug issues
const DEBUG = false;

const execAndLog = async (command) => {
  const { stdout, stderr } = await exec(command);
  if (DEBUG) {
    console.info(chalk.bold(`Command: "${command}"`));
    console.info(`Stdout: ${stdout}`);
    console.info(chalk.red(`Stderr: ${stderr}`));
  }
};

const fixContractImports = async () => {
  console.info(chalk.green('Fixing contract imports...'));

  await execAndLog(
    `yarn replace-in-file @api3-dao/pool/contracts ../pool-contracts-symlink hardhat/contracts/voting-contracts-symlink/Api3Voting.sol`
  );
  await execAndLog(
    'yarn replace-in-file @api3-dao/pool/contracts ../pool-contracts-symlink hardhat/contracts/convenience-contracts-symlink/Convenience.sol'
  );
  await execAndLog(
    'yarn replace-in-file @api3-dao/api3-voting/interfaces ../voting-interfaces-symlink hardhat/contracts/convenience-contracts-symlink/Convenience.sol'
  );
  await execAndLog('yarn replace-in-file 0.6.12 0.8.4 $(find hardhat/contracts -type f -follow)');
};

/**
 * Hacky script which makes sure the TimelockManager.sol can be compiled by hardhat.
 */
const fixTimelockManagerIssues = async () => {
  console.info(chalk.green('Fixing timelock manager issues...'));

  const performReplace = async (from, to) => {
    const options = {
      files: './node_modules/api3-dao/packages/pool/contracts/auxiliary/TimelockManager.sol',
      from,
      to,
      dry: false,
    };

    const log = await replace(options);
    if (DEBUG) {
      console.info(chalk.bold(`Options: "${JSON.stringify(options, null, 2)}"`));
      console.info(`Stdout: ${JSON.stringify(log, null, 2)}`);
    }
  };

  // NOTE: The original contract imports v0.6.12, but that version is replaced using another replace script to 0.8.4
  await performReplace('../interfaces/v0.8.4/IApi3Pool.sol', '../api3-pool-interface-symlink/IApi3Pool.sol');
  await performReplace('@openzeppelin/contracts/math/SafeMath.sol', '@openzeppelin/contracts/utils/math/SafeMath.sol');
  await performReplace(/now/g, 'block.timestamp');
};

const compileDaoContracts = async () => {
  console.info(chalk.green('Compiling contracts...'));

  await execAndLog('yarn eth:compile-contracts');
};

const generateTypechainWrappers = async () => {
  console.info(chalk.green('Generating typechain wrappers...'));

  await execAndLog(
    "yarn typechain --target ethers-v5 --out-dir ./src/generated-contracts './hardhat/artifacts/contracts/**/!(*.dbg).json'"
  );
};

const main = async () => {
  await fixContractImports();
  await fixTimelockManagerIssues();
  await compileDaoContracts();
  await generateTypechainWrappers();
};

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(chalk.red(`Error: ${error}`));
    console.error(chalk.red(`Try setting DEBUG variable to true and run again.`));
    process.exit(1);
  });
