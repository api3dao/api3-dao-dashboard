const { bold, green } = require('chalk');
const { execAndLog, promiseWrapper } = require('./utils');

// NOTE: Change this to true in case you need more information to debug issues
const DEBUG = false;

const main = async () => {
  console.info(bold(green('Generating typechain artifacts...')));

  await execAndLog(
    "yarn typechain --target ethers-v5 --out-dir ./src/contracts/artifacts './hardhat/abi/**/!(*.dbg).json'",
    DEBUG
  );
};

promiseWrapper(main);
