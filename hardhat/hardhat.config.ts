import '@nomiclabs/hardhat-ethers';
import { task, HardhatUserConfig } from 'hardhat/config';
import { existsSync } from 'fs';
import { randomBytes } from 'crypto';
import dotenv from 'dotenv';
import { BigNumber } from 'ethers';
import { addDays, parseISO } from 'date-fns';
import { parseUsd } from '../src/utils/api3-format';
import { ClaimsManager__factory as ClaimsManagerFactory } from '../src/contracts/tmp';
import { MockKlerosArbitrator__factory as MockKlerosArbitratorFactory } from '../src/contracts/tmp/factories/mock/MockKlerosArbitrator__factory';
import { ChainData } from '../src/chain-data';

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
    const receiver: string = args.address;
    const tokens = hre.ethers.utils.parseEther(args.tokens);
    const ether = hre.ethers.utils.parseEther(args.ether);

    // This needs to be in sync with deployer implementation (deployer should have funds and also be token owner)
    const deployer = (await hre.ethers.getSigners())[0];
    const contracts = getContractAddresses(hre.network.name);
    const api3Token = new hre.ethers.Contract(
      contracts.api3Token,
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
  .addParam('coverageAmount', 'The coverage amount (USD)')
  .addParam('metadata', 'The human-readable policy identifier')
  .addOptionalParam('ipfsHash', 'The IPFS policy hash')
  .addOptionalParam('claimsAllowedFrom', 'Claims are allowed from this datetime')
  .addOptionalParam('claimsAllowedUntil', 'Claims are allowed until this datetime')
  .setAction(async (args, hre) => {
    const userAddress = args.address;
    const accounts = await hre.ethers.getSigners();

    // The index for the manager needs to be in sync with the deploy script
    const manager = accounts[1];
    const contracts = getContractAddresses(hre.network.name);
    const claimsManager = ClaimsManagerFactory.connect(contracts.claimsManager, manager);

    const claimsAllowedFrom = args.claimsAllowedFrom ? parseISO(args.claimsAllowedFrom) : addDays(new Date(), -1);
    const claimsAllowedUntil = args.claimsAllowedUntil
      ? parseISO(args.claimsAllowedUntil)
      : addDays(claimsAllowedFrom, 30);
    const tx = await claimsManager.createPolicy(
      userAddress,
      userAddress,
      parseUsd(args.coverageAmount),
      BigNumber.from(Math.round(claimsAllowedFrom.getTime() / 1000)),
      BigNumber.from(Math.round(claimsAllowedUntil.getTime() / 1000)),
      args.ipfsHash || 'Qm' + randomBytes(22).toString('hex'),
      args.metadata
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
    const contracts = getContractAddresses(hre.network.name);
    const claimsManager = ClaimsManagerFactory.connect(contracts.claimsManager, manager);
    await claimsManager.acceptClaim(args.claimId);
    console.info(`Accepted Claim: ${args.claimId}`);
  });

task('propose-settlement', 'Proposes a settlement amount for the claim')
  .addParam('claimId', 'The claim ID')
  .addParam('amount', 'The settlement amount (USD)')
  .setAction(async (args, hre) => {
    const accounts = await hre.ethers.getSigners();

    // The index for the manager needs to be in sync with the deploy script
    const manager = accounts[1];
    const contracts = getContractAddresses(hre.network.name);
    const claimsManager = ClaimsManagerFactory.connect(contracts.claimsManager, manager);
    await claimsManager.proposeSettlement(args.claimId, parseUsd(args.amount));
    console.info(`Proposed a settlement of ${args.amount} USD for Claim: ${args.claimId}`);
  });

task('give-dispute-ruling', 'Gives a ruling for the dispute')
  .addParam('disputeId', 'The arbitrator dispute ID')
  .addParam('ruling', 'The arbitrator decision (0|1|2)')
  .setAction(async (args, hre) => {
    const accounts = await hre.ethers.getSigners();

    // The index for the deployer needs to be in sync with the deploy script
    const deployer = accounts[0];
    const contracts = getContractAddresses(hre.network.name);
    const arbitrator = MockKlerosArbitratorFactory.connect(contracts.arbitrator, deployer);
    await arbitrator.giveRuling(args.disputeId, args.ruling);
    console.info(`Dispute: ${args.disputeId} has been given a ruling: ${args.ruling}`);
  });

task('resolve-dispute', 'Resolves the dispute for the claim')
  .addParam('disputeId', 'The arbitrator dispute ID')
  .setAction(async (args, hre) => {
    const accounts = await hre.ethers.getSigners();

    // The index for the deployer needs to be in sync with the deploy script
    const deployer = accounts[0];
    const contracts = getContractAddresses(hre.network.name);
    const arbitrator = MockKlerosArbitratorFactory.connect(contracts.arbitrator, deployer);
    await arbitrator.executeRuling(args.disputeId);
    console.info(`Resolved dispute: ${args.disputeId}`);
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

function getContractAddresses(network: string): NonNullable<ChainData['contracts']> {
  const deploymentFileName = `../src/contract-deployments/${network}-dao.json`;

  if (!existsSync(deploymentFileName)) {
    throw new Error(`Couldn't find deployment file for network: '${network}'.`);
  }

  return require(deploymentFileName);
}
