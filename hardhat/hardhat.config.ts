import '@nomiclabs/hardhat-waffle';
import 'hardhat-deploy';
import { subtask, task, HardhatUserConfig } from 'hardhat/config';
import dotenv from 'dotenv';
import { existsSync } from 'fs';
import { execSync } from 'child_process';
import { TASK_NODE_SERVER_READY } from 'hardhat/builtin-tasks/task-names';

dotenv.config({ path: '../.env' });

// Invalid default values, just to silence hardhat configuration checks.
// (They throw on invalid network configuration - but not everyone needs to care about ropsten/mainnet)
const DEFAULT_VALUES = {
  ROPSTEN_DEPLOYER_PRIVATE_KEY: '3a9dc87d9c854849084cb47aa4f2471b9530e0f09a2b3fb3066b1a242ddef185',
  ROPSTEN_PROVIDER_URL: 'https://www.google.com/',
  MAINNET_DEPLOYER_PRIVATE_KEY: '3a9dc87d9c854849084cb47aa4f2471b9530e0f09a2b3fb3066b1a242ddef185',
  MAINNET_PROVIDER_URL: 'https://www.google.com/',
};

const fromEnvVariables = (key: string) => {
  const value = process.env[key];
  if (!value) return DEFAULT_VALUES[key as keyof typeof DEFAULT_VALUES]!;
  return value!;
};

task('accounts', 'Prints the list of accounts', async (_args, hre) => {
  const accounts = await hre.ethers.getSigners();

  for (const account of accounts) {
    console.log(account.address);
  }
});

task('send-tokens', 'Sends tokens to a specified account')
  .addParam('address', 'The address where to send the funds to')
  .addOptionalParam('amount', 'Number of tokens to send. Default is 100', '100')
  .setAction(async (args, hre) => {
    const network = hre.network.name;
    const deploymentFileName = `./deployments/${network}/Api3Token.json`;

    if (!existsSync(deploymentFileName)) {
      throw new Error(`Couldn't find deployment file for network: '${network}'.`);
    }

    const deploymentFile = require(deploymentFileName);
    const tokenOwner = (await hre.ethers.getSigners())[0]; // This needs to be in sync with deployer implementation
    const api3Token = new hre.ethers.Contract(deploymentFile.address, deploymentFile.abi, tokenOwner);

    const receiver: string = args.address;
    const amount = args.amount;

    await api3Token.transfer(receiver, '100');
    console.log(`Sent ${amount} API3 tokens to address ${receiver}`);
  });

task('fund-account', 'Sends funds to a specified account on localhost network')
  .addParam('address', 'The address where to send the funds to')
  .addOptionalParam('amount', 'Number of ETH to send. Default is 1', '1')
  .setAction(async (args, hre) => {
    const network = hre.network.name;

    // For testnets use the correspoding chain faucet
    if (network !== 'localhost') {
      throw new Error(`This commands only supports localhost network`);
    }

    const funder = (await hre.ethers.getSigners())[0];
    const receiver: string = args.address;
    const amount = hre.ethers.utils.parseEther(args.amount);

    await funder.sendTransaction({ to: receiver, value: amount });
    console.log(`Sent ${hre.ethers.utils.formatEther(amount)} ETH to address ${receiver}`);
  });

// Inspired by https://github.com/wighawag/hardhat-deploy/blob/master/src/index.ts#L631
subtask(TASK_NODE_SERVER_READY).setAction(async (args, hre, runSuper) => {
  await runSuper(args);

  const exportPath = '../src/contract-deployments/localhost-dao.json';
  // Unfortunately, calling the deploy task from yarn doesn't work at this stage.
  // Keep this logic in sync with the deploy:localhost task in package.json.
  hre.run('export', { export: exportPath });
  console.info(`Local network deployment data exported to: ${exportPath}`);
});

// See https://hardhat.org/config/
const config: HardhatUserConfig = {
  // https://hardhat.org/hardhat-network/#connecting-to-hardhat-network-from-wallets-and-other-software
  defaultNetwork: 'localhost',
  networks: {
    hardhat: {},
    ropsten: {
      url: fromEnvVariables('ROPSTEN_PROVIDER_URL'),
      accounts: [fromEnvVariables('ROPSTEN_DEPLOYER_PRIVATE_KEY')],
    },
    mainnet: {
      url: fromEnvVariables('MAINNET_PROVIDER_URL'),
      accounts: [fromEnvVariables('MAINNET_DEPLOYER_PRIVATE_KEY')],
    },
  },
  paths: {
    /**
     * TODO: Fix https://github.com/api3dao/api3-dao-dashboard/issues/8.
     *
     * For now, we need the code of the contracts to support local development. Unfortunately, there
     * need to be couple of hacks to support this:
     *  1) Use DAO contracts dependency with github URL
     *  2) We need to manually install contract dependencies (@openzeppelin/contracts)
     *  3) Hardhat complains when we want to compile source files in `../node_modules` As a
     *     workaround, I've created a symlink `contracts-symlink` which links to the DAO contracts.
     *  4) We need to use npx to run hardhat, because if we use hardhat from node_modules it wants
     *     to initialize new project in the project root (and ignores hardhat directory).
     *
     * I've tried to workaround this using solidity `--allow-paths` but that didn't work.
     */
    sources: 'contracts-symlink',
  },
  solidity: {
    compilers: [
      {
        version: '0.8.4',
        settings: {
          optimizer: {
            enabled: true,
            runs: 200,
          },
        },
      },
      {
        version: '0.6.12',
        settings: {
          optimizer: {
            enabled: true,
            runs: 200,
          },
        },
      },
    ],
  },
};

export default config;
