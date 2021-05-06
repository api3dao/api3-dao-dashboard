import { HardhatRuntimeEnvironment } from 'hardhat/types';
import { DeployFunction } from 'hardhat-deploy/types';

// Inspired by https://github.com/api3dao/api3-dao/blob/develop/packages/pool/deploy/1_deploy.js
// NOTE: Hardhat deploy will try to compile the contracts before running the deployment code.
const main: DeployFunction = async function (hre: HardhatRuntimeEnvironment) {
  const { network, ethers, deployments } = hre;

  const { deploy } = deployments;
  const accounts = await ethers.getSigners();
  const deployer = accounts[0].address;

  if (network.name === 'mainnet') {
    // TODO: we will still need the ABI and address exported for the dashboard app
    console.info('Deploying to mainnet and skipping token deployment');

    await deploy('Api3Pool', {
      from: deployer,
      args: ['0x0b38210ea11411557c13457D4dA7dC6ea731B88a'],
      log: true,
    });
  } else {
    const api3TokenInstance = await deploy('Api3Token', {
      from: deployer,
      args: [deployer, deployer],
      log: true,
    });

    await deploy('Api3Pool', {
      from: deployer,
      args: [api3TokenInstance.address],
      log: true,
    });
  }
};

export default main;
