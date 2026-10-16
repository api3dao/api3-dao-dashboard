/**
 * NOTE: We use npx to run hardhat, because if we use hardhat from node_modules it initializes a new
 * project in the project root (and ignores this hardhat directory).
 *
 * The deployment of DAO contracts is done using the DAO contracts repository
 * (https://github.com/api3dao/api3-dao). See README for more information.
 */
import '@nomiclabs/hardhat-ethers';
import { task, types, HardhatUserConfig } from 'hardhat/config';
import { existsSync } from 'fs';
import dotenv from 'dotenv';
import { encodeMetadata, goEncodeEvmScript, METADATA_SCHEME_VERSION } from '../src/logic/proposals/encoding';

dotenv.config({ path: '../.env' });

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

task('deposit-and-stake', 'Deposits and stakes API3 tokens on behalf of a specified account')
  .addParam('address', 'The account to stake for. It needs enough API3 tokens and ETH for gas')
  .addParam('deposit', 'Number of API3 tokens to deposit')
  .addParam('stake', 'Number of API3 tokens to stake. Can be at most the deposited amount')
  .setAction(async (args, hre) => {
    const network = hre.network.name;
    const deploymentFileName = `../src/contract-deployments/${network}-dao.json`;

    if (!existsSync(deploymentFileName)) {
      throw new Error(`Couldn't find deployment file for network: '${network}'.`);
    }

    const staker: string = args.address;
    const deposit = hre.ethers.utils.parseEther(args.deposit);
    const stake = hre.ethers.utils.parseEther(args.stake);
    const deploymentFile = require(deploymentFileName);

    // Lets the node sign transactions as the staker, so no private key is needed
    await hre.network.provider.request({ method: 'hardhat_impersonateAccount', params: [staker] });
    const signer = await hre.ethers.getSigner(staker);

    const api3Token = new hre.ethers.Contract(
      deploymentFile.api3Token,
      ['function approve(address spender, uint amount) returns (boolean)'],
      signer
    );
    const api3Pool = new hre.ethers.Contract(
      deploymentFile.api3Pool,
      ['function depositRegular(uint256 amount)', 'function stake(uint256 amount)'],
      signer
    );

    const approveTx = await api3Token.approve(deploymentFile.api3Pool, deposit);
    await approveTx.wait();
    const depositTx = await api3Pool.depositRegular(deposit);
    await depositTx.wait();
    console.info(`Deposited ${hre.ethers.utils.formatEther(deposit)} API3 tokens for address ${staker}`);
    const stakeTx = await api3Pool.stake(stake);
    await stakeTx.wait();
    console.info(`Staked ${hre.ethers.utils.formatEther(stake)} API3 tokens for address ${staker}`);

    await hre.network.provider.request({ method: 'hardhat_stopImpersonatingAccount', params: [staker] });
  });

task('mint-reward', 'Mints the staking reward for the current epoch, if not minted yet').setAction(
  async (_args, hre) => {
    const network = hre.network.name;
    const deploymentFileName = `../src/contract-deployments/${network}-dao.json`;

    if (!existsSync(deploymentFileName)) {
      throw new Error(`Couldn't find deployment file for network: '${network}'.`);
    }

    const deploymentFile = require(deploymentFileName);
    const deployer = (await hre.ethers.getSigners())[0];
    const api3Pool = new hre.ethers.Contract(
      deploymentFile.api3Pool,
      [
        'function mintReward()',
        'event MintedReward(uint256 indexed epochIndex, uint256 amount, uint256 newApr, uint256 totalStake)',
      ],
      deployer
    );

    const tx = await api3Pool.mintReward();
    const receipt = await tx.wait();
    const mintedEvent = receipt.events.find((event: { event?: string }) => event.event === 'MintedReward');
    if (mintedEvent) {
      console.info(`Minted ${hre.ethers.utils.formatEther(mintedEvent.args.amount)} API3 tokens as staking reward`);
    } else {
      console.info('No reward minted. It is already minted for the current epoch');
    }
  }
);

task('update-pool-minter-status', 'Updates if the pool can mint staking rewards. If not, minting is a no-op')
  .addParam('status', 'The minter status of the pool (true|false)', undefined, types.boolean)
  .setAction(async (args, hre) => {
    const network = hre.network.name;
    const deploymentFileName = `../src/contract-deployments/${network}-dao.json`;

    if (!existsSync(deploymentFileName)) {
      throw new Error(`Couldn't find deployment file for network: '${network}'.`);
    }

    const deploymentFile = require(deploymentFileName);
    // This needs to be in sync with deployer implementation (deployer should be token owner)
    const deployer = (await hre.ethers.getSigners())[0];
    const api3Token = new hre.ethers.Contract(
      deploymentFile.api3Token,
      ['function updateMinterStatus(address minterAddress, bool minterStatus)'],
      deployer
    );

    const tx = await api3Token.updateMinterStatus(deploymentFile.api3Pool, args.status);
    await tx.wait();
    console.info(`Updated the pool minter status to ${args.status}`);
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
      version: METADATA_SCHEME_VERSION,
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

task('cast-vote', 'Casts a vote on a proposal on behalf of a specified account')
  .addParam('address', 'The voter. It needs voting power at the time the proposal was created')
  .addParam('type', 'The proposal type (primary|secondary)')
  .addParam('voteId', 'The id of the proposal')
  .addParam('support', 'Whether the voter supports the proposal (true|false)', undefined, types.boolean)
  .setAction(async (args, hre) => {
    const network = hre.network.name;
    const deploymentFileName = `../src/contract-deployments/${network}-dao.json`;

    if (!existsSync(deploymentFileName)) {
      throw new Error(`Couldn't find deployment file for network: '${network}'.`);
    }

    if (!['primary', 'secondary'].includes(args.type)) {
      throw new TypeError(`Invalid type argument: ${args.type}`);
    }

    const voter: string = args.address;
    const contracts = require(deploymentFileName);

    // Lets the node sign transactions as the voter, so no private key is needed
    await hre.network.provider.request({ method: 'hardhat_impersonateAccount', params: [voter] });
    const signer = await hre.ethers.getSigner(voter);

    const api3Voting = new hre.ethers.Contract(
      args.type === 'primary' ? contracts.votingAppPrimary : contracts.votingAppSecondary,
      ['function vote(uint256 _voteId, bool _supports, bool _executesIfDecided)'],
      signer
    );

    // Executes the proposal if this vote decides it
    const tx = await api3Voting.vote(args.voteId, args.support, true);
    await tx.wait();
    console.info(`Voted ${args.support ? 'for' : 'against'} ${args.type} proposal #${args.voteId} as ${voter}`);

    await hre.network.provider.request({ method: 'hardhat_stopImpersonatingAccount', params: [voter] });
  });

// See https://hardhat.org/config/
const config: HardhatUserConfig = {
  // https://hardhat.org/hardhat-network/#connecting-to-hardhat-network-from-wallets-and-other-software
  defaultNetwork: 'localhost',
  networks: {
    hardhat: {},
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
