import '@nomiclabs/hardhat-ethers';
import { task, HardhatUserConfig } from 'hardhat/config';
import { existsSync } from 'fs';
import dotenv from 'dotenv';
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

    const network = hre.network.name;
    const deploymentFileName = `../src/contract-deployments/${network}-dao.json`;

    if (!existsSync(deploymentFileName)) {
      throw new Error(`Couldn't find deployment file for network: '${network}'.`);
    }

    if (!['primary', 'secondary'].includes(args.type)) {
      throw new TypeError(`Invalid type argument: ${args.type}`);
    }

    const contracts = require(deploymentFileName);
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
     * For now, we need the ABI of the contracts to build TypeChain wrappers for the DAO contracts.
     * We need to use npx to run hardhat, because if we use hardhat from node_modules it wants to initialize new
     * project in the project root (and ignores hardhat directory).
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
