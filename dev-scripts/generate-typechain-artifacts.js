const { join } = require('path');
const { existsSync } = require('fs');
const { bold, green } = require('chalk');
const { execAndLog, promiseWrapper } = require('./utils');

// NOTE: Change this to true in case you need more information to debug issues
const DEBUG = false;

const main = async () => {
  console.info(bold(green('Generating typechain artifacts...')));
  await execAndLog(
    "pnpm typechain --target ethers-v5 --out-dir ./src/contracts/artifacts './src/contracts/abi/**/!(*.dbg).json'",
    DEBUG
  );

  const oldArtifactsDir = join(__dirname, '../src/generated-contracts');
  if (existsSync(oldArtifactsDir)) {
    console.info(bold(green('Removing old typechain artifacts directory...')));
    await execAndLog(`rm -rf ${oldArtifactsDir}`, DEBUG);
  }
};

promiseWrapper(main);
