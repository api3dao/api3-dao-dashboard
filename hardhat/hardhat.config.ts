import '@nomiclabs/hardhat-waffle';
import 'hardhat-deploy';
import { task, HardhatUserConfig } from 'hardhat/config';
import dotenv from 'dotenv';

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
