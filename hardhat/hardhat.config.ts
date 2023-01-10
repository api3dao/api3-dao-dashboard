/**
 * NOTE: We use npx to run hardhat, because if we use hardhat from node_modules it initializes a new
 * project in the project root (and ignores this hardhat directory).
 *
 * The deployment of DAO contracts is done using the DAO contracts repository
 * (https://github.com/api3dao/api3-dao). See README for more information.
 */
import '@nomiclabs/hardhat-ethers';
import { task, HardhatUserConfig } from 'hardhat/config';
import { existsSync } from 'fs';
import { randomBytes } from 'crypto';
import dotenv from 'dotenv';
import { addDays, parseISO } from 'date-fns';
import { parseUsd } from '../src/utils/api3-format';
import { ClaimsManager__factory as ClaimsManagerFactory } from '../src/contracts/tmp';
import { MockKlerosLiquid__factory as MockKlerosArbitratorFactory } from '../src/contracts/tmp/factories/mock/MockKlerosLiquid__factory';
import { ChainData } from '../src/chain-data';
import { encodeMetadata, goEncodeEvmScript } from '../src/logic/proposals/encoding';

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

task('create-proposal', 'Creates a proposal')
  .addParam('type', 'The proposal type (primary|secondary)')
  .addParam('title', 'The proposal title')
  .addParam('description', 'The proposal description')
  .addParam('targetSignature', 'The signature of the function to call when the proposal executes')
  .addParam('parameters', 'The parameters of the function')
  .addParam('targetAddress', 'The address of the contract to call')
  .addParam('targetValue', 'The value to send when making the call')
  .addOptionalParam('script', 'The EVM script')
  .setAction(async (args, hre) => {
    const accounts = await hre.ethers.getSigners();

    if (!['primary', 'secondary'].includes(args.type)) {
      throw new TypeError(`Invalid type argument: ${args.type}`);
    }

    const contracts = getContractAddresses(hre.network.name);
    const api3Voting = new hre.ethers.Contract(
      args.type === 'primary' ? contracts.votingAppPrimary : contracts.votingAppSecondary,
      [
        'function newVote(bytes _executionScript, string _metadata, bool _castVote, bool _executesIfDecided) returns (uint256 voteId)',
      ],
      accounts[0]
    );

    const formData = {
      type: args.type,
      title: args.title,
      description: args.description,
      targetSignature: args.targetSignature,
      parameters: args.parameters,
      targetAddress: args.targetAddress,
      targetValue: args.targetValue,
    };

    let script = args.script;
    if (!script) {
      const agents = { primary: contracts.agentAppPrimary, secondary: contracts.agentAppSecondary };
      const result = await goEncodeEvmScript(hre.ethers.provider, formData, agents);
      if (result.success) {
        script = result.data;
      } else {
        throw result.error;
      }
    }

    await api3Voting['newVote(bytes,string,bool,bool)'](script, encodeMetadata(formData), true, true);
    console.info(`Successfully created a ${formData.type} proposal: ${formData.title}`);
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
    const ipfsHash = args.ipfsHash || 'Qm' + randomBytes(22).toString('hex');

    // We use a multicall in order to create the policy and announce its metadata in the same transaction
    const createCall = claimsManager.interface.encodeFunctionData('createPolicy', [
      userAddress,
      parseUsd(args.coverageAmount),
      Math.round(claimsAllowedFrom.getTime() / 1000),
      Math.round(claimsAllowedUntil.getTime() / 1000),
      ipfsHash,
    ]);
    const metadataCall = claimsManager.interface.encodeFunctionData('announcePolicyMetadata', [
      userAddress,
      Math.round(claimsAllowedFrom.getTime() / 1000),
      ipfsHash,
      args.metadata,
    ]);
    const tx = await claimsManager.multicall([createCall, metadataCall]);

    await tx.wait();
    const createdEvents = await claimsManager.queryFilter(claimsManager.filters.CreatedPolicy(userAddress));

    console.info(`User policies (${createdEvents.length}):`);
    console.info(
      JSON.stringify(
        createdEvents.map((event) => event.args.policyHash),
        null,
        2
      )
    );
  });

task('upgrade-user-policy', 'Upgrades the policy with given params')
  .addParam('policyId', 'The policy ID')
  .addParam('coverageAmount', 'The coverage amount (USD)')
  .addParam('claimsAllowedUntil', 'Claims are allowed until this datetime')
  .setAction(async (args, hre) => {
    const accounts = await hre.ethers.getSigners();

    // The index for the manager needs to be in sync with the deploy script
    const manager = accounts[1];
    const contracts = getContractAddresses(hre.network.name);
    const claimsManager = ClaimsManagerFactory.connect(contracts.claimsManager, manager);

    const createdEvent = (await claimsManager.queryFilter(claimsManager.filters.CreatedPolicy(null, args.policyId)))[0];

    if (!createdEvent) {
      throw new Error('Policy does not exist');
    }

    await claimsManager.upgradePolicy(
      createdEvent.args.claimant,
      parseUsd(args.coverageAmount),
      createdEvent.args.claimsAllowedFrom,
      Math.round(parseISO(args.claimsAllowedUntil).getTime() / 1000),
      createdEvent.args.policy
    );
    console.info(`Upgraded Policy: ${args.policyId}`);
  });

task('downgrade-user-policy', 'Downgrades the policy with given params')
  .addParam('policyId', 'The policy ID')
  .addParam('coverageAmount', 'The coverage amount (USD)')
  .addParam('claimsAllowedUntil', 'Claims are allowed until this datetime')
  .setAction(async (args, hre) => {
    const accounts = await hre.ethers.getSigners();

    // The index for the manager needs to be in sync with the deploy script
    const manager = accounts[1];
    const contracts = getContractAddresses(hre.network.name);
    const claimsManager = ClaimsManagerFactory.connect(contracts.claimsManager, manager);

    const createdEvent = (await claimsManager.queryFilter(claimsManager.filters.CreatedPolicy(null, args.policyId)))[0];

    if (!createdEvent) {
      throw new Error('Policy does not exist');
    }

    await claimsManager.downgradePolicy(
      createdEvent.args.claimant,
      parseUsd(args.coverageAmount),
      createdEvent.args.claimsAllowedFrom,
      Math.round(parseISO(args.claimsAllowedUntil).getTime() / 1000),
      createdEvent.args.policy
    );
    console.info(`Downgraded Policy: ${args.policyId}`);
  });

task('update-policy-metadata', 'Updates the policy metadata')
  .addParam('policyId', 'The policy ID')
  .addParam('metadata', 'The policy metadata')
  .setAction(async (args, hre) => {
    const accounts = await hre.ethers.getSigners();

    // The index for the manager needs to be in sync with the deploy script
    const manager = accounts[1];
    const contracts = getContractAddresses(hre.network.name);
    const claimsManager = ClaimsManagerFactory.connect(contracts.claimsManager, manager);

    const createdEvent = (await claimsManager.queryFilter(claimsManager.filters.CreatedPolicy(null, args.policyId)))[0];

    if (!createdEvent) {
      throw new Error('Policy does not exist');
    }

    await claimsManager.announcePolicyMetadata(
      createdEvent.args.claimant,
      createdEvent.args.claimsAllowedFrom,
      createdEvent.args.policy,
      args.metadata
    );
    console.info(`Updated Policy: ${args.policyId} metadata to: ${args.metadata}`);
  });

task('accept-claim', 'Accepts the given claim')
  .addParam('claimId', 'The claim ID')
  .setAction(async (args, hre) => {
    const accounts = await hre.ethers.getSigners();

    // The index for the manager needs to be in sync with the deploy script
    const manager = accounts[1];
    const contracts = getContractAddresses(hre.network.name);
    const claimsManager = ClaimsManagerFactory.connect(contracts.claimsManager, manager);

    const createdEvent = (
      await claimsManager.queryFilter(claimsManager.filters.CreatedClaim(null, null, args.claimId))
    )[0];
    if (!createdEvent) {
      throw new Error('Claim does not exist');
    }

    await claimsManager.acceptClaim(
      createdEvent.args.policyHash,
      createdEvent.args.claimant,
      createdEvent.args.claimAmountInUsd,
      createdEvent.args.evidence
    );
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

    const createdEvent = (
      await claimsManager.queryFilter(claimsManager.filters.CreatedClaim(null, null, args.claimId))
    )[0];
    if (!createdEvent) {
      throw new Error('Claim does not exist');
    }

    await claimsManager.proposeSettlement(
      createdEvent.args.policyHash,
      createdEvent.args.claimant,
      createdEvent.args.claimAmountInUsd,
      createdEvent.args.evidence,
      parseUsd(args.amount)
    );
    console.info(`Proposed a settlement of ${args.amount} USD for Claim: ${args.claimId}`);
  });

task('give-dispute-ruling', 'Gives a ruling for the dispute')
  .addParam('disputeId', 'The arbitrator dispute ID')
  .addParam('ruling', 'The arbitrator decision (0|1|2)')
  .addOptionalParam('appealPeriodLength', 'The amount of time allowed to appeal (in seconds)')
  .setAction(async (args, hre) => {
    const accounts = await hre.ethers.getSigners();

    // The index for the deployer needs to be in sync with the deploy script
    const deployer = accounts[0];
    const contracts = getContractAddresses(hre.network.name);
    const arbitrator = MockKlerosArbitratorFactory.connect(contracts.arbitrator, deployer);

    // Set all the period times to zero before the appeal period
    await arbitrator.__setSubcourtTimesPerPeriod(1, [0, 0, 0, args.appealPeriodLength ?? 300]);
    // Pass the period so that we land in the vote period
    await arbitrator.passPeriod(args.disputeId);
    await arbitrator.__setCurrentRulingAndPassPeriodFromVoteToAppeal(args.disputeId, args.ruling);
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

    // Pass the appeal period so that we land in the execution period
    await arbitrator.passPeriod(args.disputeId);
    await arbitrator.executeRuling(args.disputeId);
    console.info(`Resolved dispute: ${args.disputeId}`);
  });

task(
  'pass-dispute-period',
  'Progresses the dispute into its next period (given that the current period end date has passed)'
)
  .addParam('disputeId', 'The arbitrator dispute ID')
  .setAction(async (args, hre) => {
    const accounts = await hre.ethers.getSigners();

    // The index for the deployer needs to be in sync with the deploy script
    const deployer = accounts[0];
    const contracts = getContractAddresses(hre.network.name);
    const arbitrator = MockKlerosArbitratorFactory.connect(contracts.arbitrator, deployer);
    await arbitrator.passPeriod(args.disputeId);
    console.info(`Dispute: ${args.disputeId} has passed into its next period`);
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

function getContractAddresses(network: string): NonNullable<ChainData['contracts']> {
  const deploymentFileName = `../src/contract-deployments/${network}-dao.json`;

  if (!existsSync(deploymentFileName)) {
    throw new Error(`Couldn't find deployment file for network: '${network}'.`);
  }

  return require(deploymentFileName);
}
