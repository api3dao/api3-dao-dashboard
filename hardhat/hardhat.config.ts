import '@nomiclabs/hardhat-ethers';
import { task, HardhatUserConfig } from 'hardhat/config';
import { existsSync } from 'fs';
import dotenv from 'dotenv';
import { BigNumber } from 'ethers';
import { addDays } from 'date-fns';
import { parseApi3 } from '../src/utils/api3-format';
import { ClaimsManagerWithKlerosArbitrator__factory as ClaimsManagerFactory } from '../src/contracts/tmp';

dotenv.config({ path: '../.env' });

// Invalid default values, just to silence hardhat configuration checks.
// (They throw on invalid network configuration - but not everyone needs to care about these)
const DEFAULT_VALUES = {
  RINKEBY_DEPLOYER_PRIVATE_KEY: '3a9dc87d9c854849084cb47aa4f2471b9530e0f09a2b3fb3066b1a242ddef185',
  RINKEBY_PROVIDER_URL: 'https://www.google.com/',
};

const fromEnvVariables = (key: string) => {
  const value = process.env[key];
  if (!value) return DEFAULT_VALUES[key as keyof typeof DEFAULT_VALUES]!;
  return value!;
};

task('accounts', 'Prints the list of accounts', async (_args, hre) => {
  const accounts = await hre.ethers.getSigners();

  for (const account of accounts) {
    console.info(account.address);
  }
});

task('send-to-account', 'Sends ether or API3 tokens to a specified account')
  .addParam('address', 'The address where to send the funds to')
  .addOptionalParam('tokens', 'Number of API3 tokens to send. Default is 100', '100')
  .addOptionalParam('ether', 'Amount of ETH to send. Default is 0', '0')
  .setAction(async (args, hre) => {
    const network = hre.network.name;
    const deploymentFileName = `../src/contract-deployments/${network}-dao.json`;

    if (!existsSync(deploymentFileName)) {
      throw new Error(`Couldn't find deployment file for network: '${network}'.`);
    }

    const receiver: string = args.address;
    const tokens = hre.ethers.utils.parseEther(args.tokens);
    const ether = hre.ethers.utils.parseEther(args.ether);

    const deploymentFile = require(deploymentFileName);
    // This needs to be in sync with deployer implementation (deployer should have funds and also be token owner)
    const deployer = (await hre.ethers.getSigners())[0];
    const api3Token = new hre.ethers.Contract(
      deploymentFile.api3Token,
      ['function transfer(address to, uint amount) returns (boolean)'],
      deployer
    );

    await api3Token.transfer(receiver, tokens);
    console.info(`Sent ${hre.ethers.utils.formatEther(tokens)} API3 tokens to address ${receiver}`);
    await deployer.sendTransaction({ to: receiver, value: ether });
    console.info(`Sent ${hre.ethers.utils.formatEther(ether)} ETH to address ${receiver}`);
  });

task('create-user-policy', 'Creates a policy for the given user')
  .addParam('address', 'The user address')
  .addParam('coverageAmount', 'The coverage amount')
  .addParam('ipfsHash', 'The IPFS policy hash')
  .setAction(async (args, hre) => {
    const network = hre.network.name;
    const deploymentFileName = `../src/contract-deployments/${network}-dao.json`;

    if (!existsSync(deploymentFileName)) {
      throw new Error(`Couldn't find deployment file for network: '${network}'.`);
    }

    const userAddress = args.address;
    const accounts = await hre.ethers.getSigners();

    // The index for the manager needs to be in sync with the deploy script
    const manager = accounts[1];
    const deploymentFile = require(deploymentFileName);
    const claimsManager = ClaimsManagerFactory.connect(deploymentFile.claimsManager, manager);
    const tx = await claimsManager.createPolicy(
      userAddress,
      userAddress,
      parseApi3(args.coverageAmount),
      BigNumber.from(Math.round(addDays(new Date(), -1).getTime() / 1000)),
      BigNumber.from(Math.round(addDays(new Date(), 30).getTime() / 1000)),
      args.ipfsHash
    );

    await tx.wait();
    const createdEvents = await claimsManager.queryFilter(claimsManager.filters.CreatedPolicy(null, userAddress));

    console.info(`User policies (${createdEvents.length}):`);
    createdEvents.forEach((event) => {
      console.info(event.args.policyHash);
    });
  });

task('accept-claim', 'Accepts the given claim')
  .addParam('claimId', 'The claim ID')
  .setAction(async (args, hre) => {
    const accounts = await hre.ethers.getSigners();

    // The index for the manager needs to be in sync with the deploy script
    const manager = accounts[1];
    const claimsManager = ClaimsManagerFactory.connect(process.env.REACT_APP_CLAIMS_MANAGER_ADDRESS!, manager);
    await claimsManager.acceptClaim(args.claimId);
    console.info(`Accepted Claim: ${args.claimId}`);
  });

task('propose-settlement', 'Proposes a settlement amount for the claim')
  .addParam('claimId', 'The claim ID')
  .addParam('amount', 'The settlement amount')
  .setAction(async (args, hre) => {
    const accounts = await hre.ethers.getSigners();

    // The index for the manager needs to be in sync with the deploy script
    const manager = accounts[1];
    const claimsManager = ClaimsManagerFactory.connect(process.env.REACT_APP_CLAIMS_MANAGER_ADDRESS!, manager);
    await claimsManager.proposeSettlement(args.claimId, parseApi3(args.amount));
    console.info(`Proposed a settlement of ${args.amount} API3 for Claim: ${args.claimId}`);
  });

task('resolve-dispute', 'Resolves the dispute for the claim')
  .addParam('disputeId', 'The arbitrator dispute ID')
  .addParam('ruling', 'The arbitrator decision (0|1|2)')
  .setAction(async (args, hre) => {
    const accounts = await hre.ethers.getSigners();

    // The index for the arbitrator needs to be in sync with the deploy script
    const arbitrator = accounts[2];
    const claimsManager = ClaimsManagerFactory.connect(process.env.REACT_APP_CLAIMS_MANAGER_ADDRESS!, arbitrator);
    await claimsManager.rule(args.disputeId, args.ruling);
    console.info(`Resolved dispute: ${args.disputeId} with ruling: ${args.ruling}`);
  });

// See https://hardhat.org/config/
const config: HardhatUserConfig = {
  // https://hardhat.org/hardhat-network/#connecting-to-hardhat-network-from-wallets-and-other-software
  defaultNetwork: 'localhost',
  networks: {
    hardhat: {},
    // NOTE: Non local networks are only needed for hardhat tasks
    rinkeby: {
      url: fromEnvVariables('RINKEBY_PROVIDER_URL'),
      accounts: [fromEnvVariables('RINKEBY_DEPLOYER_PRIVATE_KEY')],
    },
  },
  paths: {
    /**
     * For now, we need the code of the contracts to build TypeChain wrappers for solidity contracts. Unfortunately,
     * there need to be couple of hacks to support this:
     *  1) Use DAO contracts dependency with github URL
     *  2) We need to manually install contract dependencies (@openzeppelin/contracts)
     *  3) Hardhat complains when we want to compile source files in `../node_modules` As a workaround, I've created a
     *     `contracts` directory which contains symbolic links to the DAO contracts.
     *  4) We need to use npx to run hardhat, because if we use hardhat from node_modules it wants to initialize new
     *     project in the project root (and ignores hardhat directory).
     *
     * I've tried to workaround this using solidity `--allow-paths` but that didn't work.
     *
     * NOTE: The deployment of DAO contracts is done using the DAO contracts repository
     * (https://github.com/api3dao/api3-dao). See README for more information.
     */
    sources: 'contracts',
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
      // Needed to compile aragon DAO contracts
      {
        version: '0.4.24',
        settings: {
          optimizer: {
            enabled: true,
            runs: 10000,
          },
        },
      },
    ],
  },
};

export default config;
