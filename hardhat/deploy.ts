import { run, ethers, network } from 'hardhat';

// Inspired by https://github.com/api3dao/api3-dao/blob/develop/packages/pool/deploy/1_deploy.js
async function main() {
  // Make sure contracts are compiled (this is noop if they already are)
  await run('compile');

  const accounts = await ethers.getSigners();
  const Api3Token = await ethers.getContractFactory('Api3Token');
  const Api3Pool = await ethers.getContractFactory('Api3Pool');

  // TODO: For deployments to testnet/mainnet there needs to be a funded account
  // and a bit more configuration on hardhat/fleek side.
  if (network.name !== 'localhost') {
    throw new Error(`Not supporting deployments to network: ${network.name}`);
  }

  const tokenOwner = accounts[0].address;
  const api3TokenInstance = await Api3Token.deploy(tokenOwner, tokenOwner);
  await Api3Pool.deploy(api3TokenInstance.address);

  console.info(`Successfully deployed contract(s) to network: ${network.name}`);
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
