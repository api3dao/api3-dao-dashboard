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

task('delegate-voting-power', 'Delegates the voting power of a specified account')
  .addParam('address', 'The account to delegate from. It needs staked API3 tokens and ETH for gas')
  .addParam('delegate', 'The account to delegate to')
  .setAction(async (args, hre) => {
    const network = hre.network.name;
    const deploymentFileName = `../src/contract-deployments/${network}-dao.json`;

    if (!existsSync(deploymentFileName)) {
      throw new Error(`Couldn't find deployment file for network: '${network}'.`);
    }

    const delegator: string = args.address;
    const deploymentFile = require(deploymentFileName);

    // Lets the node sign transactions as the delegator, so no private key is needed
    await hre.network.provider.request({ method: 'hardhat_impersonateAccount', params: [delegator] });
    const signer = await hre.ethers.getSigner(delegator);

    const api3Pool = new hre.ethers.Contract(
      deploymentFile.api3Pool,
      ['function delegateVotingPower(address delegate)'],
      signer
    );

    const tx = await api3Pool.delegateVotingPower(args.delegate);
    await tx.wait();
    console.info(`Delegated the voting power of address ${delegator} to address ${args.delegate}`);

    await hre.network.provider.request({ method: 'hardhat_stopImpersonatingAccount', params: [delegator] });
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

task(
  'execute-migration-vote',
  'Passes the primary vote that moves governance to Snapshot. See https://github.com/api3dao/api3-dao-migration-proposal'
)
  .addParam('address', 'The voter. It needs more than half of the voting power, so that its vote alone passes the vote')
  .setAction(async (args, hre) => {
    const network = hre.network.name;
    const deploymentFileName = `../src/contract-deployments/${network}-dao.json`;

    if (!existsSync(deploymentFileName)) {
      throw new Error(`Couldn't find deployment file for network: '${network}'.`);
    }

    const { utils } = hre.ethers;
    const voter: string = args.address;
    const contracts = require(deploymentFileName);
    const deployer = (await hre.ethers.getSigners())[0];
    // The deployer stands in for the Treasury Safe
    const treasurySafe = deployer.address;
    const deadAddress = '0x000000000000000000000000000000000000dEaD';
    const anyEntity = '0xFFfFfFffFFfffFFfFFfFFFFFffFFFffffFfFFFfF';
    const maxPct = utils.parseEther('1').sub(1);

    const api3Token = new hre.ethers.Contract(
      contracts.api3Token,
      [
        'function totalSupply() view returns (uint256)',
        'function balanceOf(address account) view returns (uint256)',
        'function transferOwnership(address newOwner)',
      ],
      deployer
    );
    // On mainnet the primary agent owns the token. The local deployment leaves it with the deployer.
    const ownershipTx = await api3Token.transferOwnership(contracts.agentAppPrimary);
    await ownershipTx.wait();

    const acl = new utils.Interface([
      'function grantPermission(address entity, address app, bytes32 role)',
      'function revokePermission(address entity, address app, bytes32 role)',
      'function removePermissionManager(address app, bytes32 role)',
    ]);
    const agent = new utils.Interface([
      'function execute(address target, uint256 ethValue, bytes data)',
      'function transfer(address token, address to, uint256 value)',
    ]);
    const token = new utils.Interface([
      'function updateMinterStatus(address minterAddress, bool minterStatus)',
      'function mint(address account, uint256 amount)',
      'function transferOwnership(address newOwner)',
    ]);
    const voting = new utils.Interface([
      'function changeSupportRequiredPct(uint64 supportRequiredPct)',
      'function changeMinAcceptQuorumPct(uint64 minAcceptQuorumPct)',
    ]);

    const direct = (target: string, data: string) => ({ target, data });
    const viaAgent = (target: string, data: string) =>
      direct(contracts.agentAppPrimary, agent.encodeFunctionData('execute', [target, 0, data]));

    // The calls of the mainnet vote script, in the same order. The secondary agent's transfers (calls 3 to 6) are left
    // out, because the tokens they move do not exist locally.
    const calls = [
      direct(
        contracts.acl,
        acl.encodeFunctionData('grantPermission', [
          contracts.agentAppPrimary,
          contracts.agentAppSecondary,
          utils.id('TRANSFER_ROLE'),
        ])
      ),
      direct(
        contracts.acl,
        acl.encodeFunctionData('grantPermission', [
          contracts.agentAppPrimary,
          contracts.agentAppSecondary,
          utils.id('EXECUTE_ROLE'),
        ])
      ),
      direct(
        contracts.agentAppPrimary,
        agent.encodeFunctionData('transfer', [
          contracts.api3Token,
          treasurySafe,
          await api3Token.balanceOf(contracts.agentAppPrimary),
        ])
      ),
      viaAgent(contracts.api3Token, token.encodeFunctionData('updateMinterStatus', [contracts.api3Pool, false])),
      viaAgent(contracts.api3Token, token.encodeFunctionData('updateMinterStatus', [contracts.agentAppPrimary, true])),
      viaAgent(
        contracts.api3Token,
        token.encodeFunctionData('mint', [
          treasurySafe,
          utils.parseEther('200000000').sub(await api3Token.totalSupply()),
        ])
      ),
      viaAgent(contracts.api3Token, token.encodeFunctionData('updateMinterStatus', [contracts.agentAppPrimary, false])),
      viaAgent(contracts.api3Token, token.encodeFunctionData('transferOwnership', [deadAddress])),
      direct(
        contracts.acl,
        acl.encodeFunctionData('revokePermission', [
          anyEntity,
          contracts.votingAppPrimary,
          utils.id('CREATE_VOTES_ROLE'),
        ])
      ),
      direct(
        contracts.acl,
        acl.encodeFunctionData('revokePermission', [
          anyEntity,
          contracts.votingAppSecondary,
          utils.id('CREATE_VOTES_ROLE'),
        ])
      ),
      direct(
        contracts.acl,
        acl.encodeFunctionData('removePermissionManager', [contracts.votingAppPrimary, utils.id('CREATE_VOTES_ROLE')])
      ),
      direct(
        contracts.acl,
        acl.encodeFunctionData('removePermissionManager', [contracts.votingAppSecondary, utils.id('CREATE_VOTES_ROLE')])
      ),
      viaAgent(contracts.votingAppPrimary, voting.encodeFunctionData('changeSupportRequiredPct', [maxPct])),
      viaAgent(contracts.votingAppPrimary, voting.encodeFunctionData('changeMinAcceptQuorumPct', [maxPct])),
      viaAgent(contracts.votingAppSecondary, voting.encodeFunctionData('changeSupportRequiredPct', [maxPct])),
      viaAgent(contracts.votingAppSecondary, voting.encodeFunctionData('changeMinAcceptQuorumPct', [maxPct])),
      direct(
        contracts.acl,
        acl.encodeFunctionData('removePermissionManager', [contracts.votingAppPrimary, utils.id('MODIFY_SUPPORT_ROLE')])
      ),
      direct(
        contracts.acl,
        acl.encodeFunctionData('removePermissionManager', [contracts.votingAppPrimary, utils.id('MODIFY_QUORUM_ROLE')])
      ),
      direct(
        contracts.acl,
        acl.encodeFunctionData('removePermissionManager', [
          contracts.votingAppSecondary,
          utils.id('MODIFY_SUPPORT_ROLE'),
        ])
      ),
      direct(
        contracts.acl,
        acl.encodeFunctionData('removePermissionManager', [
          contracts.votingAppSecondary,
          utils.id('MODIFY_QUORUM_ROLE'),
        ])
      ),
      direct(
        contracts.acl,
        acl.encodeFunctionData('revokePermission', [
          contracts.votingAppPrimary,
          contracts.dao,
          utils.id('APP_MANAGER_ROLE'),
        ])
      ),
      direct(
        contracts.acl,
        acl.encodeFunctionData('removePermissionManager', [contracts.dao, utils.id('APP_MANAGER_ROLE')])
      ),
      direct(
        contracts.acl,
        acl.encodeFunctionData('revokePermission', [
          contracts.votingAppPrimary,
          contracts.acl,
          utils.id('CREATE_PERMISSIONS_ROLE'),
        ])
      ),
      direct(
        contracts.acl,
        acl.encodeFunctionData('removePermissionManager', [contracts.acl, utils.id('CREATE_PERMISSIONS_ROLE')])
      ),
    ];
    // See the CallsScript layout in:
    // https://github.com/aragon/aragonOS/blob/f3ae59b00f73984e562df00129c925339cd069ff/contracts/evmscript/executors/CallsScript.sol#L26
    const script = utils.hexConcat([
      '0x00000001',
      ...calls.map(({ target, data }) =>
        utils.hexConcat([target, utils.hexZeroPad(utils.hexlify(utils.hexDataLength(data)), 4), data])
      ),
    ]);
    // Version 3 of the metadata scheme has no target signature, because the script makes multiple calls
    const metadata = ['3', 'New path for API3', 'Moves governance to Snapshot'].join(String.fromCharCode(31));

    // Lets the node sign transactions as the voter, so no private key is needed
    await hre.network.provider.request({ method: 'hardhat_impersonateAccount', params: [voter] });
    const signer = await hre.ethers.getSigner(voter);

    const api3Voting = new hre.ethers.Contract(
      contracts.votingAppPrimary,
      [
        'function newVote(bytes _executionScript, string _metadata, bool _castVote, bool _executesIfDecided) returns (uint256 voteId)',
        'event ExecuteVote(uint256 indexed voteId)',
      ],
      signer
    );

    // Votes for the proposal right away, which decides and executes it
    const tx = await api3Voting['newVote(bytes,string,bool,bool)'](script, metadata, true, true);
    const receipt = await tx.wait();
    if (!receipt.events.some((event: { event?: string }) => event.event === 'ExecuteVote')) {
      throw new Error(`The migration vote did not execute. Does ${voter} hold more than half of the voting power?`);
    }
    console.info(`Executed the migration vote as ${voter}`);

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
